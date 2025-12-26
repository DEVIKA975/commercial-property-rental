const express = require("express");
const cors = require("cors");
const sendEnquiryRoute = require("./routes/sendEnquiry");

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.217:5173"
];

app.use(cors({
  origin: allowedOrigins
}));


app.use(express.json());

app.use("/api/send-enquiry", sendEnquiryRoute);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

