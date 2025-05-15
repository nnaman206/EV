import React, { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";

function After_Admin_Login() {
  const [stationDetails, setStationDetails] = useState({
    stationName: "EV Station Alpha", // Replace with the actual station
    address: "Dehradun EV Park, Sector 21",
    totalSlots: 3
  });
  const [bookedSlots, setBookedSlots] = useState(0);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem('allBookings')) || [];

    // Filter bookings for this admin’s station
    const filtered = bookings.filter(
      booking =>
        booking.stationName === stationDetails.stationName &&
        booking.address === stationDetails.address
    );

    setBookedSlots(filtered.length);
    setUserList(
      filtered.map(b => ({
        name: b.userName,
        id: b.userId
      }))
    );
  }, [stationDetails]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Station Overview</h1>

      <div className="bg-gray-100 p-4 rounded shadow space-y-3">
        <h2 className="text-xl font-semibold">{stationDetails.stationName}</h2>
        <p><strong>Address:</strong> {stationDetails.address}</p>
        <p><strong>Slots Booked:</strong> {bookedSlots}</p>
        <p><strong>Slots Available:</strong> {stationDetails.totalSlots - bookedSlots}</p>

        <div className="mt-2">
          <strong>Users Booked:</strong>
          {userList.length > 0 ? (
            <ul className="list-disc ml-6">
              {userList.map((user, i) => (
                <li key={i}>{user.name} (ID: {user.id})</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No users booked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default After_Admin_Login;
