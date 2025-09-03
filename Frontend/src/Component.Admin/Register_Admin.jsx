import React, { useState, useRef } from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { Link } from "react-router-dom";

const libraries = ["places"];

function Register_Admin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [clipMsg, setClipMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [slotCount, setSlotCount] = useState("");
  const [slotData, setSlotData] = useState({});

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

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const formatted = place?.formatted_address || place?.name || "";
      setAddress(formatted);
      console.log("Selected Address:", formatted);
    }
  };

  const times = Array.from({ length: 24 }, (_, i) => {
    const h = i < 10 ? `0${i}` : i;
    return `${h}:00 - ${h === "23" ? "00" : i + 1 < 10 ? `0${i + 1}` : i + 1}:00`;
  });

  const confirm = async (e) => {
    e.preventDefault();

    if (!validateName(name)) return clipAct("Invalid Name Entered");
    if (!validateEmail(email)) return clipAct("Invalid Email Entered");
    if (!validatePassword(password)) return clipAct("Invalid Password Entered");
    if (!address) return clipAct("Address is required");

  const formattedSlotData = Object.entries(slotData).map(([time, totalSlots]) => ({
  time,
  totalSlots: parseInt(totalSlots, 10),
}));


    if (formattedSlotData.length === 0) return clipAct("Please add at least one slot");

    const userData = {
      name,
      email,
      password,
      address,
      slotData: formattedSlotData,
    };

    try {
      const response = await fetch("http://localhost:3000/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        clipAct("Welcome On Board. Kindly Login");
        setName("");
        setAddress("");
        setEmail("");
        setPassword("");
        setSelectedTime("");
        setSlotCount("");
        setSlotData({});
      } else {
        clipAct(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      clipAct("Server Error");
    }
  };

  return (
    <LoadScript googleMapsApiKey="YOUR GOOGLE API KEY" libraries={libraries}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
        <div className="flex w-[90%] max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Left Side */}
          <div className="w-1/2 bg-gradient-to-br from-red-500 to-blue-500 text-white flex flex-col justify-center items-center py-16 px-10">
            <h1 className="text-4xl font-bold mb-6">Welcome Back!</h1>
            <p className="mb-10 text-center text-lg">
              To keep connected with us please login with your personal info
            </p>
            <Link
              to="/sign-in"
              className="border border-white cursor-pointer text-white px-6 py-2 rounded-full hover:bg-white hover:text-blue-600 transition"
            >
              SIGN IN
            </Link>
          </div>

          {/* Right Side */}
          <div className="w-1/2 py-10 px-8 flex flex-col justify-center overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">
              Create Account
            </h1>
            <div className="flex justify-center gap-4 mb-6">
              <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">f</span>
              <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">G+</span>
              <span className="text-xl font-bold cursor-pointer border px-3 py-1 rounded-full border-gray-300">in</span>
            </div>
            <p className="text-center text-gray-600 mb-6 text-sm">
              or use your email for registration
            </p>
            <form onSubmit={confirm} className="flex flex-col gap-5">
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
              <Autocomplete
                onLoad={(auto) => setAutocomplete(auto)}
                onPlaceChanged={handlePlaceChanged}
                options={{
                  types: ["address"],
                  componentRestrictions: { country: "in" },
                }}
              >
                <input
                  type="text"
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="px-4 py-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                />
              </Autocomplete>

              {/* Slot Selection */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-blue-600 mb-2">Select Slot Time</h2>
                <div className="flex overflow-x-auto space-x-3 pb-2">
                  {times.map((time, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`px-4 py-2 rounded-full border whitespace-nowrap ${
                        selectedTime === time
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>

                {selectedTime && (
                  <div className="mt-4 flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Slots Available for <span className="text-blue-600">{selectedTime}</span>:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={slotCount}
                      onChange={(e) => setSlotCount(e.target.value)}
                      className="px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter number of slots"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!slotCount || isNaN(slotCount)) {
                          clipAct("Please enter a valid slot count");
                          return;
                        }
                        setSlotData((prev) => ({
                          ...prev,
                          [selectedTime]: parseInt(slotCount),
                        }));
                        setSlotCount("");
                        setSelectedTime("");
                        clipAct("Slot added successfully");
                      }}
                      className="self-start bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                    >
                      Save Slot
                    </button>
                  </div>
                )}

                {/* Preview */}
                {Object.entries(slotData).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Saved Slots:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {Object.entries(slotData).map(([time, total]) => (
                        <li key={time}>
                          {time}: {total} slots
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

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
    </LoadScript>
  );
}

export default Register_Admin;
