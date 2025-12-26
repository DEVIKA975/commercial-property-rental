import app from './app';
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));

import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { getAuthUrl, getTokenFromCode, refreshAccessToken } from "./services/graphAuth.js";
import { sendGraphEmail } from "./services/graphEmail.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// ------------------------------------
// STEP 1 — Redirect user to Microsoft Login
// ------------------------------------
app.get("/auth/login", (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// ------------------------------------
// STEP 2 — Callback from Microsoft
// ------------------------------------
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokens = await getTokenFromCode(code);

    // Save tokens in cookies
    res.cookie("access_token", tokens.access_token, { httpOnly: true });
    res.cookie("refresh_token", tokens.refresh_token, { httpOnly: true });

    res.send("Microsoft Login Successful! You can close this tab now.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Authentication failed.");
  }
});

// ------------------------------------
// STEP 3 — Send Email via Graph API
// ------------------------------------
app.post("/send-email", async (req, res) => {
  try {
    let accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && refreshToken) {
      // refresh the token
      accessToken = await refreshAccessToken(refreshToken);
      res.cookie("access_token", accessToken, { httpOnly: true });
    }

    if (!accessToken) {
      return res.status(401).json({ error: "User not authenticated. Please login." });
    }

    const { to, subject, message } = req.body;

    await sendGraphEmail(accessToken, to, subject, message);

    res.json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on http://localhost:${process.env.PORT}`)
);

