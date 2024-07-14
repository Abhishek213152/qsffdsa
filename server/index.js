const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");
const CryptoJS = require("crypto-js");
const mongoose = require("mongoose");
const Order = require("./models/Order"); // Update with the path to your Order model

dotenv.config({ path: "config.env" });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8000;

// Function to generate a unique transaction ID
const generateTransactionId = () => "T" + Date.now();

// Payment initiation route
app.post("/payment", async (req, res) => {
  console.log(req.body);

  try {
    const price = parseFloat(req.body.price);
    const { user_id, phone, name, email, tempId } = req.body;

    // Set the values to variables for later use
    const merchantTransactionId = generateTransactionId();
    const data = {
      merchantId: process.env.MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: "MUID" + user_id,
      name: name,
      amount: price * 100,
      redirectUrl: `http://localhost:3001/status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: phone,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + process.env.SALT_KEY;
    const sha256 = CryptoJS.SHA256(string).toString();
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL =
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    const requestData = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    const response = await axios.request(requestData);
    const phonePeTransactionId = response.data.transactionId;
    res.status(201).send({
      msg: "Payment initiated",
      status: "success",
      data: response.data,
      phonePeTransactionId: phonePeTransactionId,
    });
    console.log("Payment API Response:", response.data);
  } catch (e) {
    console.error("Internal Server Error:", e.message);
    res
      .status(500)
      .json({
        msg: "Internal Server Error",
        status: "error",
        error: e.message,
      });
  }
});

// Payment status checking route
app.post("/status/:txnId", async (req, res) => {
  try {
    const merchantTransactionId = req.params.txnId;
    const merchantId = process.env.MERCHANT_ID;
    const key = process.env.SALT_KEY;
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + key;
    const sha256 = CryptoJS.SHA256(string).toString();
    const checksum = sha256 + "###" + keyIndex;

    const URL = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const options = {
      method: "GET",
      url: URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    };

    const response = await axios.request(options);

    if (response.data.data.responseCode === "SUCCESS") {
      // Create a new order instance
      const newOrder = new Order({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        transactionId: merchantTransactionId,
        paymentStatus: response.data.data.responseCode,
        price: req.body.price,
        user: req.body.user_id,
        dateOrdered: Date.now(),
      });

      // Save the new order to the database
      await newOrder.save();

      // Redirect to the success URL
      const url = "http://localhost:4200/success";
      return res.redirect(url);
    } else {
      // Redirect to the failure URL
      const url = "http://localhost:4200/failure";
      return res.redirect(url);
    }
  } catch (error) {
    console.error("Status API Error:", error.message);
    res
      .status(500)
      .json({
        msg: "Error checking payment status",
        status: "error",
        error: error.message,
      });
  }
});

app.listen(PORT, () => {
  console.log(`Server started in development mode on port ${PORT}`);
});
