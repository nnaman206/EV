import React, { useState } from 'react';
import { FaLocationArrow } from "react-icons/fa";

// Static data moved outside the component (best practice)
const slots = ['9:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '2:00 PM - 3:00 PM'];

const stationData = {
  "Dehradun": [
    { name: "Rajpur EV Station", address: "Rajpur Road, Dehradun, Uttarakhand" },
    { name: "ISBT EV Hub", address: "ISBT, Dehradun, Uttarakhand" },
    { name: "Clock Tower Charging", address: "Near Clock Tower, Dehradun, Uttarakhand" }
  ],
  "Delhi": [
    { name: "Connaught Place EV", address: "Connaught Place, New Delhi" },
    { name: "Saket EV Point", address: "Saket, New Delhi" }
  ]
};

function Current_Stage() {
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const bookingData = JSON.parse(localStorage.getItem('bookingData'));

  const [isCancelled, setIsCancelled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [city, setCity] = useState('');
  const [station, setStation] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slot, setSlot] = useState('');

  const stationOptions = stationData[city] || [];

  const handleCancel = () => {
    localStorage.removeItem('bookingData');
    setIsCancelled(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('bookingData');
    window.location.reload();
  };

  const confirmBooking = async () => {
    // Basic validation
    if (!city || !station || !address || !date || !time || !slot) {
      alert("Please fill in all booking details.");
      return;
    }

    const newBooking = {
      userId: userData._id,
      userName: userData.name,
      city,
      stationName: station,
      address,
      date,
      time,
      slot,
    };

    try {
      const response = await fetch("http://localhost:5000/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("bookingData", JSON.stringify(newBooking));
        setShowPopup(false);
        window.location.reload();
      } else {
        alert(result.message || "Booking failed");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Something went wrong while processing your booking. Please try again later.");
    }
  };

  return (
    <div className="w-96 mx-auto mt-6 p-4 rounded-xl shadow-md bg-amber-100">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-black">
          Welcome, {userData.name || 'User'}
        </h2>
      </div>

      {!bookingData || isCancelled ? (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg text-center">
          No current booking found.
          <button
            onClick={() => setShowPopup(true)}
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            New Booking
          </button>
        </div>
      ) : (
        <div className="bg-amber-300 p-4 rounded-lg space-y-2">
          <h3 className="text-xl font-semibold text-black">Booking Details</h3>
          <p><span className="font-semibold">City:</span> {bookingData.city}</p>
          <p><span className="font-semibold">Station:</span> {bookingData.stationName}</p>
          <p>
            <span className="font-semibold">Address:</span> {bookingData.address}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingData.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block ml-2 text-blue-700 hover:text-blue-900"
              title="View on Google Maps"
            >
              <FaLocationArrow size={16} />
            </a>
          </p>
          <p><span className="font-semibold">Date:</span> {bookingData.date}</p>
          <p><span className="font-semibold">Time:</span> {bookingData.time}</p>
          <p><span className="font-semibold">Slot:</span> {bookingData.slot}</p>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleCancel}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Cancel Booking
            </button>
            <button
              onClick={() => setShowPopup(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              New Booking
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={handleLogout}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>

      {/* Popup for New Booking */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-[400px] shadow-xl">
            <h2 className="text-xl font-bold mb-2">New Booking</h2>
            <input
              type="text"
              placeholder="City (e.g., Dehradun, Delhi)"
              value={city}
              onChange={(e) => {
                const input = e.target.value;
                setCity(input);
                setStation('');
                setAddress('');
              }}
              className="w-full mb-2 px-3 py-2 border rounded"
            />

            <select
              value={station}
              onChange={(e) => {
                const selectedStation = e.target.value;
                setStation(selectedStation);
                const found = stationOptions.find(s => s.name === selectedStation);
                setAddress(found ? found.address : '');
              }}
              className="w-full mb-2 px-3 py-2 border rounded"
            >
              <option value="">Select Station</option>
              {stationOptions.map((s, idx) => (
                <option key={idx} value={s.name}>{s.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Address"
              value={address}
              readOnly
              className="w-full mb-2 px-3 py-2 border rounded bg-gray-100"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded"
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded"
            />

            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full mb-2 px-3 py-2 border rounded"
            >
              <option value="">Select Slot</option>
              {slots.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Current_Stage;
