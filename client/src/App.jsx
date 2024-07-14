import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import User from "./components/User";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { auth } from "./firebase";
import PhonePe from "./components/PhonePe";

function App() {
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user);
  //   });

  //   return () => unsubscribe();
  // }, []);

  return (
    // <Routes>
    //   <Route path="/" element={user ? <Navigate to="/user" /> : <Login />} />
    //   <Route
    //     path="/signup"
    //     element={user ? <Navigate to="/user" /> : <Signup />}
    //   />
    //   <Route
    //     path="/user"
    //     element={user ? <User user={user} /> : <Navigate to="/" />}
    //   />
    // </Routes>
    <PhonePe />
  );
}

export default App;
