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
          loginType: "GOOGLE", // Make sure you added loginType in Prisma
          googleId: sub,
          profilePicture: picture,
          password: "", // Optional: leave blank or null for OAuth users
          isEmailVerified: true, // Since Google verified
        },
      });
    }
    if (user && !user.isEmailVerified) {
      user = await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    // Redirect to frontend success page
    res.redirect(
      `http://localhost:3000/auth/success?token=${token}&email=${user.email}&name=${encodeURIComponent(user.fullName)}`
    );
  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
