import axios from "axios";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";


export const githubAuthRedirect = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(url);
};

export const githubAuthCallback = async (req, res) => {
  try {
    const code = req.query.code;

    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) throw new Error("No access token received from GitHub");

    // 2. Fetch user info from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const { login, id: githubId, avatar_url } = userResponse.data;

    // 3. Fetch user email
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `token ${accessToken}` },
    });
    const primaryEmailObj = emailResponse.data.find((e) => e.primary && e.verified);
    const email = primaryEmailObj?.email;
    if (!email) throw new Error("No verified email found");

    // 4. Find or create user in DB
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: login,
          loginType: "GITHUB",
          githubId: githubId.toString(),
          profilePicture: avatar_url,
          isEmailVerified: true,
        },
      });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Redirect to frontend success page
    res.redirect(
      `http://localhost:3000/auth/success?token=${token}&email=${user.email}&name=${encodeURIComponent(
        user.fullName
      )}`
    );
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
