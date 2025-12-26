// src/graphClient.js
import dotenv from "dotenv";
import fetch from "node-fetch"; // optional; Node 18+ has global fetch. Keep for compatibility.
dotenv.config();

const TENANT = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const SENDER_EMAIL = process.env.SENDER_EMAIL;

if (!TENANT || !CLIENT_ID || !CLIENT_SECRET || !SENDER_EMAIL) {
  throw new Error("Missing required env vars (TENANT_ID, CLIENT_ID, CLIENT_SECRET, SENDER_EMAIL)");
}

const TOKEN_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Get app-only access token (client credentials).
 * Caches token in memory until expiration.
 */
export async function getAppOnlyToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 15_000) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to obtain token: ${res.status} ${txt}`);
  }

  const json = await res.json();
  cachedToken = json.access_token;
  // expires_in is seconds
  tokenExpiresAt = Date.now() + (json.expires_in || 3600) * 1000;
  return cachedToken;
}

/**
 * Send email using Graph as the configured sender user.
 * Uses /users/{sender}/sendMail which requires Application Mail.Send permission.
 *
 * @param {string} to - destination email address (or array)
 * @param {string} subject
 * @param {string} htmlBody
 */
export async function sendMailFromSender(to, subject, htmlBody) {
  const token = await getAppOnlyToken();
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(SENDER_EMAIL)}/sendMail`;

  const message = {
    message: {
      subject: subjecst,
      body: {
        contentType: "HTML",
        content: htmlBody,
      },
      toRecipients: Array.isArray(to)
        ?. to.map((t) => ({ emailAddress: { address: t } }))
        :' [{ emailAddress: { address: to } }],
      // Optionally set from or sender; for app-only send, sending as the user above is recommended.
    },
    saveToSentItems: "true",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph sendMail failed: ${res.status} ${text}`);
  }

  return true;
}
