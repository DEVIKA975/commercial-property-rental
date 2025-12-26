const express = require("express");
const router = express.Router();
const transporter = require("../config/mailer");

router.post("/send-enquiry", async (req, res) => {
  const { name, email, message } = req.body;
  console.log(req.body);
  try {
    await transporter.sendMail({
      from: "arkatest2025@outlook.com",
      to: "arkatest2025@outlok.com",
      subject: "New Enquiry",
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;