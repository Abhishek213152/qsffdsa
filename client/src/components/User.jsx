import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";

const User = ({ user }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/details/${user.email}`
        );
        setData(response.data);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchData();
  }, [user.email]);

  const logOut = () => {
    signOut(auth);
  };

  return (
    <div>
      {data ? (
        <div>
          <h3>{data.name}</h3>
          <h3>{data.email}</h3>
          <h3>{data.password}</h3>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <button onClick={logOut}>Log Out</button>
    </div>
  );
};

export default User;
