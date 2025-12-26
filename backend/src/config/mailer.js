const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: "arkatest2025@outlook.com",
    pass: "jhsnqfzwcxzzgdbm"
  }
});

module.exports = transporter;
