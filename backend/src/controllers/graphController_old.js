import { exchangeCodeForToken } from "../services/graphAuth.js";
import { sendGraphEmail } from "../services/graphEmail.js";

const clientId = process.env.MS_CLIENT_ID;
const clientSecret = process.env.MS_CLIENT_SECRET;
const redirectUri = "http://localhost:4000/auth/callback";

// In-memory storage (replace with DB)
let refreshTokenStored = null;

export async function microsoftLogin(req, res) {
  const loginUrl =
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize" +
    `?client_id=${clientId}` +
    "&response_type=code" +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&scope=offline_access Mail.Send Mail.Read";

  res.redirect(loginUrl);
}

export async function microsoftCallback(req, res) {
  const code = req.query.code;

  const tokenData = await exchangeCodeForToken({
    clientId,
    clientSecret,
    redirectUri,
    code,
  });

  refreshTokenStored = tokenData.refresh_token;

  res.send("Authentication successful! Refresh token saved.");
}

export async function sendEmailFromGraph(req, res) {
  try {
    const accessToken = req.body.accessToken;
    await sendGraphEmail(accessToken);
    res.send("Email sent.");
  } catch (err) {
    res.status(500).send(err.message);
  }
}
