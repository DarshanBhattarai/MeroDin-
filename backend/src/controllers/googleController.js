// src/controllers/googleController.js - UPDATED
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleAuthRedirect = (req, res) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["profile", "email"],
  });
  res.redirect(url);
};

export const googleAuthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: "Invalid token" });

    const { email, name, picture, sub } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          fullName: name,
          loginType: "GOOGLE",
          googleId: sub,
          profilePicture: picture,
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

    // Generate JWT tokens (same as your login flow)
    const accessToken = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_ACCESS_SECRET, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // Set HttpOnly cookies (same as your login flow)
    res.cookie('access_token', accessToken, {
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

    // Redirect to frontend success page
    res.redirect(`${process.env.APP_URL}/auth/success`);

  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.redirect(`${process.env.APP_URL}/auth/login?error=oauth_failed`);
  }
};