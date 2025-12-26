const express = require("express");
const router = express.Router();
const { sendEnquiry } = require("../controllers/sendEnquiryController");

router.post("/", sendEnquiry);

module.exports = router;
