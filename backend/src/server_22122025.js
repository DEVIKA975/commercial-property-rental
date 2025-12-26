// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { exchangeCodeForToken, refreshAccessToken, sendMail } from "./smtpClient.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const AUTH_SCOPE = "offline_access openid https://outlook.office.com/SMTP.Send";

const app = express();

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "2mb" }));
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => res.send("SMTP-OAuth2 backend is up"));

/**
 * Step 1: Redirect user to Microsoft login for consent & code
 */
app.get("/auth/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    response_mode: "query",
    scope: AUTH_SCOPE,
    prompt: "consent", // force consent so we receive refresh_token the first time
  });

  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  res.redirect(url);
});

/**
 * Step 2: Callback receives code and exchanges for tokens
 */
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code in callback");

  try {
    const tokens = await exchangeCodeForToken(code);
    // tokens saved by exchangeCodeForToken
    res.send(`<h3>Auth success — refresh token stored.</h3><p>You can close this window.</p>`);
  } catch (err) {
    console.error("Auth callback failed:", err);
    res.status(500).send("Auth failed. See server logs.");
  }
});

/**
 * API: send-email
 * Public endpoint (no login required) — uses stored refresh token to send as SENDER_EMAIL.
 */
app.post("/send-email", async (req, res) => {
  console.log(req.body)
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) return res.status(400).json({ error: "Missing fields" });

    // Optionally sanitize message here
    const info = await sendMail(to, subject, message);
    console.log("Email sent:", info.messageId);
    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.log(err)
    console.error("Failed to send email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

/**
 * Optional: small endpoint to check if stored refresh token exists
 */
app.get("/auth/status", async (req, res) => {
  try {
    const token = await refreshAccessToken();
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

