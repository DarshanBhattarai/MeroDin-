// src/controllers/githubController.js - UPDATED
import axios from "axios";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const githubAuthRedirect = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(url);
};

export const githubAuthCallback = async (req, res) => {
  try {
    console.log("🔄 GitHub OAuth callback started");
    const code = req.query.code;

    if (!code) {
      console.log("❌ Missing code parameter");
      return res.status(400).send("Missing code");
    }

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

    console.log("✅ GitHub access token received");

    // 2. Fetch user info from GitHub API
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const { login, id: githubId, avatar_url, name } = userResponse.data;
    console.log("✅ GitHub user data:", { login, name });

    // 3. Fetch user email
    const emailResponse = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `token ${accessToken}` },
    });
    
    const primaryEmailObj = emailResponse.data.find((e) => e.primary && e.verified);
    const email = primaryEmailObj?.email;
    
    if (!email) throw new Error("No verified email found");
    console.log("✅ GitHub email:", email);

    // 4. Find or create user in DB
    let user = await prisma.user.findUnique({ where: { email } });
    console.log("🔍 Found existing user:", user ? "Yes" : "No");

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: name || login, // Use name if available, otherwise login
          loginType: "GITHUB",
          githubId: githubId.toString(),
          profilePicture: avatar_url,
          password: "",
          isEmailVerified: true,
        },
      });
      console.log("✅ New GitHub user created:", user.id);
    } else if (!user.isEmailVerified) {
      user = await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });
      console.log("✅ GitHub user email verified");
    }

    // 5. Generate JWT tokens (same as Google flow)
    const jwtAccessToken = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    console.log("✅ JWT tokens generated for user:", user.id);

    // 6. Set HttpOnly cookies (same as Google flow)
    res.cookie('access_token', jwtAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    console.log("✅ Cookies set for GitHub user");
    
    // 7. Redirect to frontend success page
    const redirectUrl = "http://localhost:3000/auth/success";
    console.log("🔄 Redirecting GitHub user to:", redirectUrl);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ GitHub OAuth Error:", error);
    res.redirect("http://localhost:3000/auth/login?error=github_oauth_failed");
  }
};