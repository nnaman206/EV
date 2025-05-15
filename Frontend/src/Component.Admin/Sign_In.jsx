import React, { useState, useRef, useEffect } from "react";
import { Navigate } from "react-router";

function Sign_In() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clipMsg, setClipMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const clipTimer = useRef(null);

  const clipAct = (msg) => {
    setClipMsg(msg);
    setShowPopup(true);
    clearTimeout(clipTimer.current);
    clipTimer.current = setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const confirm = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return clipAct("Invalid Email Entered");
    if (!validatePassword(password)) return clipAct("Invalid Password Entered");

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) return clipAct(data.message || "Login failed");
      clipAct(`Welcome back, ${data.name}`);
      setRedirect(true); // Redirect after successful login

    } catch (err) {
      clipAct("Server error. Try again later.");
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (!storedUser) {
      clipAct("Please register first.");
    }
  }, []);

  if (redirect) {
    return <Navigate to="/admin-dashboard" />; // Change this route as needed
  }

  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      <div className="flex w-[90%] max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">
        {/* Left Side */}
        <div className="w-1/2 bg-gradient-to-br from-red-500 to-blue-500 text-white flex flex-col justify-center items-center py-16 px-10">
          <h1 className="text-4xl font-bold mb-6">Welcome!</h1>
          <p className="mb-10 text-center text-lg">New Here?</p>
          <button
            type="button"
            className="border border-white text-white px-6 py-2 rounded-full hover:bg-white hover:text-blue-600 transition"
          >
            SIGN UP
          </button>
        </div>

        {/* Right Side */}
        <div className="w-1/2 py-12 px-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">Sign in</h1>
          <form onSubmit={confirm} className="flex flex-col gap-4">
            
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border rounded-md border-gray-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 border rounded-md border-gray-300"
            />
            
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-3 rounded-full hover:bg-blue-600 transition"
            >
              SIGN IN
            </button>
          </form>
        </div>
      </div>

      {/* Popup */}
      <div
        className={`fixed top-5 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out bg-gray-800 text-white px-6 py-3 rounded-lg z-50 ${
          showPopup ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
      >
        {clipMsg}
      </div>
    </div>
  );
}

export default Sign_In;
