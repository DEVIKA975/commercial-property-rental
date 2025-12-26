//import fs from "fs/promises";
//import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  SENDER_EMAIL,
  TENANT_ID = "common", 
  //TOKEN_STORE = "./tokens.json",
} = process.env;

// Check required variables
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !SENDER_EMAIL) {
  throw new Error("Missing environment variables in .env (CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SENDER_EMAIL)");
}

// 1. Helper: Save Tokens
import OAuthToken from "../models/OAuthToken.js";

export async function saveTokens(tokens) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  await OAuthToken.findOneAndUpdate(
    { provider: "microsoft" },
    {
      provider: "microsoft",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expires_at: expiresAt,
    },
    { upsert: true, new: true }
  );

  console.log("✅ Tokens saved to MongoDB");
}


// 2. Helper: Read Tokens
export async function getStoredTokens() {
  const tokenDoc = await OAuthToken.findOne({ provider: "microsoft" });

  if (!tokenDoc) {
    throw new Error("No Microsoft OAuth tokens found. Authorize first.");
  }

  return tokenDoc;
}


// 3. Exchange Auth Code for Tokens
export async function exchangeCodeForToken(authCode) {
  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("grant_type", "authorization_code");
  params.append(
    "scope",
    "offline_access openid https://outlook.office.com/SMTP.Send"
  );
  params.append("code", authCode);

  const response = await axios.post(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    params
  );

  await saveTokens(response.data);
  return response.data;
}


// 4. Get Access Token 
async function getValidAccessToken() {
  const tokenDoc = await getStoredTokens();

  const isExpired =
    !tokenDoc.expires_at || tokenDoc.expires_at < new Date();

  if (isExpired) {
    console.log("⏰ Access token expired. Refreshing...");
    return await refreshAccessToken();
  }

  return tokenDoc.access_token;
}


// 5. Refresh Token Logic
export async function refreshAccessToken() {
  const tokenDoc = await getStoredTokens();

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("refresh_token", tokenDoc.refresh_token);
  params.append("grant_type", "refresh_token");

  const response = await axios.post(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    params
  );

  const expiresAt = new Date(Date.now() + response.data.expires_in * 1000);

  tokenDoc.access_token = response.data.access_token;
  tokenDoc.refresh_token =
    response.data.refresh_token || tokenDoc.refresh_token;
  tokenDoc.expires_at = expiresAt;
  tokenDoc.scope = response.data.scope;
  tokenDoc.token_type = response.data.token_type;

  await tokenDoc.save();

  console.log("🔄 Token refreshed (MongoDB)");
  return tokenDoc.access_token;
}


// 6. Send Email (FIXED: removed await from transporter config)
export async function sendMail(to, subject, htmlBody) {
  const tokenDoc = await getStoredTokens();
  const accessToken = await getValidAccessToken();

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      type: "OAuth2",
      user: SENDER_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      accessToken,
      refreshToken: tokenDoc.refresh_token,
    },
  });

  return transporter.sendMail({
    from: SENDER_EMAIL,
    to,
    subject,
    html: htmlBody,
  });
}
