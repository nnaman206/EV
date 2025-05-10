import React, { useState, useRef } from 'react';

function Register_user() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clipMsg, setClipMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const clipTimer = useRef(null);

  const clipAct = (msg) => {
    setClipMsg(msg);
    setShowPopup(true);
    clearTimeout(clipTimer.current);
    clipTimer.current = setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  const validateName = (name) => /^[A-Za-z\s]{2,}$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const confirm = (e) => {
    e.preventDefault();
    if (!validateName(name)) return clipAct("Invalid Name Entered");
    if (!validateEmail(email)) return clipAct("Invalid Email Entered");
    if (!validatePassword(password)) return clipAct("Invalid Password Entered");
    const userData={
      name:name,
      email:email,
      password:password,
    }
    localStorage.setItem("userData",JSON.stringify(userData));
    clipAct("Welcome On Board. Kindly Login");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      <h1>REGISTER User</h1>
  <div className="flex w-[90%] max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">

    {/* Left Side */}
    <div className="w-1/2 bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex flex-col justify-center items-center py-16 px-10">
      <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
      <p className="mb-10 text-center text-lg">To keep connected with us please login with your personal info</p>
      <button
        type="button"
        className="border border-white text-white px-6 py-2 rounded-full hover:bg-white hover:text-blue-600 transition"
      >
        SIGN IN
      </button>
    </div>

    {/* Right Side */}
    <div className="w-1/2 py-12 px-10 flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">Create Account</h1>
      <div className="flex justify-center gap-4 mb-6">
        <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">f</span>
        <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">G+</span>
        <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">in</span>
      </div>
      <p className="text-center text-gray-600 mb-6 text-sm">or use your email for registration</p>
      <form onSubmit={confirm} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white cursor-pointer px-4 py-3 rounded-full hover:bg-blue-600 transition"
        >
          Sign Up
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

export default Register_user;
