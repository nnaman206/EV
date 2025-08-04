import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function After_Admin_Login() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get adminId passed via React Router state on login
  const { adminId } = location.state || {};

  const [stationDetails, setStationDetails] = useState(null);
  const [bookedSlots, setBookedSlots] = useState(0);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to login if no adminId (means unauthorized access)
  useEffect(() => {
    if (!adminId) {
      navigate("/sign_in");
    }
  }, [adminId, navigate]);

  // Fetch station + bookings for this admin from backend API
  useEffect(() => {
    if (!adminId) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:5000/api/admin/${adminId}/station`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch station data");
        }

        const stationData = await res.json();

        setStationDetails(stationData.station);
        setBookedSlots(stationData.bookings.length);
        setUserList(
          stationData.bookings.map((b) => ({
            name: b.userName,
            id: b.userId,
          }))
        );

        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.message || "Error loading data");
      }
    }

    fetchData();
  }, [adminId]);

  if (loading) return <div className="p-6">Loading station data...</div>;

  if (error)
    return (
      <div className="p-6 text-red-600 font-bold">
        Error: {error}. Please try again later.
      </div>
    );

  if (!stationDetails)
    return (
      <div className="p-6">
        <h2>No station data found for this admin.</h2>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Station Overview</h1>

      <div className="bg-gray-100 p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">{stationDetails.stationName}</h2>
        <p>
          <strong>Address:</strong> {stationDetails.address}
        </p>
        <p>
          <strong>Slots Booked:</strong> {bookedSlots}
        </p>
        <p>
          <strong>Slots Available:</strong>{" "}
          {stationDetails.totalSlots - bookedSlots}
        </p>

        <div>
          <strong>Users Booked:</strong>
          {userList.length > 0 ? (
            <ul className="list-disc ml-6 mt-2">
              {userList.map((user, i) => (
                <li key={i}>
                  {user.name} (ID: {user.id})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mt-2">No users booked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default After_Admin_Login;
