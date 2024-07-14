import React, { useState } from "react";
import axios from "axios";

const PhonePe = () => {
  const [userId, setUserId] = useState("12345");
  const [price, setPrice] = useState(100);
  const [phone, setPhone] = useState("2132457896");
  const [name, setName] = useState("Abhishek");

  const handleClick = async () => {
    let data = {
      user_id: userId,
      price: price,
      phone: phone,
      name: name,
    };

    try {
      const response = await axios.post("http://localhost:8000/payment", data);
      window.location.href =
        response.data.data.instrumentResponse.redirectInfo.url;
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200 range
        console.error("Error response:", error.response.data);
      } else if (error.request) {
        // Request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something else happened while setting up the request
        console.error("Error message:", error.message);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20rem",
      }}
    >
      <button
        onClick={handleClick}
        style={{ cursor: "pointer", fontSize: "2rem" }}
      >
        Pay Now
      </button>
    </div>
  );
};

export default PhonePe;
