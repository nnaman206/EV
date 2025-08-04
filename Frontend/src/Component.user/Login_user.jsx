import React from 'react'
import {useState,useRef,useEffect} from "react"
import { Link } from 'react-router-dom';

function Login_user() {
 
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
 
   
   const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   const validatePassword = (password) =>
     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
 
   const confirm = async (e) => {
  e.preventDefault();

  if (!validateEmail(email)) return clipAct("Invalid Email Entered");
  if (!validatePassword(password)) return clipAct("Invalid Password Entered");

  try {
    const response = await fetch("http://localhost:5000/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return clipAct(data.message || "Login failed");
    }

    clipAct(`Welcome back, ${data.user.name}`);
    // You may want to redirect or store the logged-in user
    setEmail("");
    setPassword("");
  } catch (error) {
    console.error("Login error:", error);
    clipAct("Server error. Please try again.");
  }
};

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      clipAct("Please register first.");
     
    }
  }, []);
    
 
   return (
     <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
   <div className="flex w-[90%] max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">
 
     {/* Left Side */}
     <div className="w-1/2 bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex flex-col justify-center items-center py-16 px-10">
  <h1 className="text-4xl font-bold mb-6">Welcome!</h1>
  <p className="mb-10 text-center text-lg">New Here?</p>

  <Link
    to="/register-user"
    className="border border-white cursor-pointer text-white px-6 py-2 rounded-full hover:bg-white hover:text-blue-600 transition"
  >
    SIGN UP
  </Link>
</div>

 
     {/* Right Side */}
     <div className="w-1/2 py-12 px-10 flex flex-col justify-center">
       <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">Sign in</h1>
       <div className="flex justify-center gap-4 mb-6">
         <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">f</span>
         <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">G+</span>
         <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">in</span>
       </div>
       <p className="text-center text-gray-600 mb-6 text-sm">or use your email for registration</p>
       <form onSubmit={confirm} className="flex flex-col gap-6">
        
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
        SIGN IN
         </button>
         <span className='cursor-pointer text-center text-gray-600 mb-6 text-sm'>Forget your password?</span>
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
  )
}

export default Login_user
