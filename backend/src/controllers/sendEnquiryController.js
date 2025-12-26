const nodemailer = require("nodemailer");

exports.sendEnquiry = async (req, res) => {
  console.log("📩 New enquiry received:", req);
  try {
    const { name, email, phone, intent, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        msg: "Name and email are required."
      });
    }

    console.log(" New enquiry received:", { name, email, phone, intent, message });

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: "devika_aj@outlook.com",
        pass: "Connect@123"
      },
      tls: { ciphers: "SSLv3" }
    });

    const mailOptions = {
      from: "devika_aj@outlook.com",
      to: "arun_r@outlook.com",
      subject: `New Enquiry from ${name}`,
      text: `
A new enquiry has been submitted:

Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Intent: ${intent}
Message:
${message || "No message provided."}
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      msg: "Enquiry sent successfully."
    });

  } catch (err) {
    console.error("❌ Error sending enquiry:", err);

    return res.status(500).json({
      success: false,
      msg: "Server error. Could not send enquiry."
    });
  }
};
