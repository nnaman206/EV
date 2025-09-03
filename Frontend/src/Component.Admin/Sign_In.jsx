import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Sign_In() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clipMsg, setClipMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); // Added loading state
  const clipTimer = useRef(null);
  const navigate = useNavigate();

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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );

  const confirm = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      clipAct("Invalid Email Entered");
      return;
    }
    if (!validatePassword(password)) {
      clipAct("Invalid Password Entered. Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.");
      return;
    }

    setLoading(true); // Set loading to true when request starts
    try {
      const res = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("API Response:", data); // Log the full API response
      console.log("Response OK status:", res.ok); // Log the res.ok status

      if (!res.ok) {
        clipAct(data.message || "Login failed: Please check your credentials.");
        setLoading(false); // Set loading to false on failure
        return;
      }

      if (!data.admin) {
        clipAct("Login successful, but admin data is missing from response.");
        setLoading(false); // Set loading to false if admin data is missing
        return;
      }
      console.log("Admin Data:", data.admin); // Log the admin data
      clipAct(`Welcome back, ${data.admin?.ownerName || "Admin"}`); // Using ownerName as per After_Admin_Login.jsx
      setLoading(false); // Set loading to false on success
      navigate("/adminDashboard", { state: { userData: data.admin } }); // Ensure key is userData
    } catch (err) {
      console.error("Network or server error during login:", err); // Log network errors
      clipAct("Server error. Please try again later.");
      setLoading(false); // Set loading to false on error
    }
  };

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
            // You might want to add navigation to /register-admin or /register-user here
            // onClick={() => navigate("/register-admin")} 
          >
            SIGN UP
          </button>
        </div>

        {/* Right Side */}
        <div className="w-1/2 py-12 px-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">
            Sign in
          </h1>
          <form onSubmit={confirm} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading} // Disable input when loading
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading} // Disable input when loading
            />

            <button
              type="submit"
              className={`bg-blue-500 text-white px-4 py-3 rounded-full transition ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600 cursor-pointer'}`}
              disabled={loading} // Disable button when loading
            >
              {loading ? "Signing In..." : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>

      {/* Popup */}
      <div
        className={`fixed top-5 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out bg-gray-800 text-white px-6 py-3 rounded-lg z-50 ${
          showPopup
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10"
        }`}
      >
        {clipMsg}
      </div>
    </div>
  );
}

export default Sign_In;
