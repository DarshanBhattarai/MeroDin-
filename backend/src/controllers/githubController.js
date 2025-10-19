// src/controllers/githubController.js
import axios from "axios";
import prisma from "../lib/prisma.js";
import userService from "../services/auth.service.js";
import { generateAccessToken, generateRefreshToken } from "../lib/auth.js";

export const githubAuthRedirect = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(url);
};

export const githubAuthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessTokenFromGitHub = tokenResponse.data.access_token;
    if (!accessTokenFromGitHub) throw new Error("No access token from GitHub");

    // 2. Fetch user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessTokenFromGitHub}` },
    });

    const { login, id: githubId, avatar_url, name } = userResponse.data;

    // 3. Fetch primary verified email
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `token ${accessTokenFromGitHub}` },
      }
    );
    const primaryEmailObj = emailResponse.data.find(
      (e) => e.primary && e.verified
    );
    const email = primaryEmailObj?.email;
    if (!email) throw new Error("No verified email found");

    // 4. Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: name || login,
          loginType: "GITHUB",
          githubId: githubId.toString(),
          profilePicture: avatar_url,
          password: "",
          isEmailVerified: true,
        },
      });
    } else if (!user.isEmailVerified) {
      user = await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });
    }

    // 5. Generate app tokens
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // 6. Save refresh token in DB via service (same as Google login)
    await userService.saveRefreshToken(user.id, refreshToken);

    // 7. Set cookies
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    // 8. Redirect to frontend success page
    res.redirect(`${process.env.APP_URL}/pages/auth/success`);
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    res.redirect(
      `${process.env.APP_URL}/pages/auth/login?error=github_oauth_failed`
    );
  }
};
