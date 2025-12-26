export async function sendGraphEmail(accessToken, to, subject, message) {
  const emailData = {
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: message
      },
      toRecipients: [
        { emailAddress: { address: to } }
      ]
    }
  };

  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me/sendMail",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailData)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error("Microsoft Graph Error: " + error);
  }
}
