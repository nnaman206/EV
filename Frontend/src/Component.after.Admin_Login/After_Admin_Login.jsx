import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

// A reusable form component for adding or editing a slot
const SlotForm = ({
    slot = {},
    onSubmit,
    onCancel,
    isLoading,
    submitText,
    title,
}) => {
    const [time, setTime] = useState(slot.time || "");
    const [totalSlots, setTotalSlots] = useState(slot.totalSlots || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!time.trim() || !totalSlots.toString().trim() || isNaN(parseInt(totalSlots))) {
            return;
        }
        onSubmit({ time, totalSlots: parseInt(totalSlots) });
    };

    return (
        <div className="mt-8 pt-6 border-t border-gray-300">
            <h2 className="text-xl font-bold mb-4 text-blue-700">{title}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:space-x-2 w-full">
                <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Time (e.g., 09:00 - 10:00)"
                    className="p-2 border rounded-md mb-2 sm:mb-0 w-full sm:w-1/2"
                    disabled={isLoading}
                    aria-label="Slot Time"
                />
                <input
                    type="number"
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(e.target.value)}
                    placeholder="Total Slots"
                    className="p-2 border rounded-md mb-2 sm:mb-0 w-full sm:w-1/4"
                    disabled={isLoading}
                    aria-label="Total Slots"
                />
                <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                        type="submit"
                        className={`bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : submitText}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};


function After_Admin_Login() {
    const location = useLocation();
    const [adminData, setAdminData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Added loading state for session check

    const [editingSlot, setEditingSlot] = useState(null);
    const [addingNewSlot, setAddingNewSlot] = useState(false);
    
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [showBookedUsersPopup, setShowBookedUsersPopup] = useState(false);
    const [bookedUsers, setBookedUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [removingUserId, setRemovingUserId] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);

    const [clipMsg, setClipMsg] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const clipTimer = useRef(null);

    const clipAct = (msg) => {
        setClipMsg(msg);
        setShowPopup(true);
        clearTimeout(clipTimer.current);
        clipTimer.current = setTimeout(() => {
            setShowPopup(false);
        }, 2500);
    };
    
    // Logout now hits a backend endpoint to destroy the session
    const handleLogout = useCallback(async () => {
        try {
            await fetch("http://localhost:3000/api/admin/logout", {
                method: "POST",
                credentials: 'include' // Important for sending session cookies
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setAdminData(null);
            // In a real multi-page app, you would navigate to the sign-in page here.
            clipAct("You have been logged out.");
        }
    }, []);

    // Fetches details for an already authenticated admin
    const fetchAdminDetails = useCallback(async (adminId) => {
        if (!adminId) return;
        try {
            const res = await fetch(`http://localhost:3000/api/admins/station/${adminId}`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch details");
            setAdminData(data); // Set the full admin data
        } catch (err) {
            console.error("Error fetching admin details:", err);
            clipAct("Session expired or invalid. Please log in again.");
            handleLogout();
        }
    }, [handleLogout]);

    const fetchBookedUsers = useCallback(async (adminId) => {
        if (!adminId) return;
        setIsLoadingUsers(true);
        try {
            const res = await fetch(`http://localhost:3000/api/admin/${adminId}/booked-users`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch users");
            setBookedUsers(data.users || []);
        } catch (err) {
            clipAct("Could not fetch booked users.");
            setBookedUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    // Main useEffect to check session and fetch initial data
    useEffect(() => {
        // This function checks if there's an active session on the backend
        const checkSession = async () => {
            try {
                // First, check if admin data was passed from the login page
                if (location.state?.userData) {
                    const initialData = location.state.userData;
                    setAdminData(initialData);
                    await fetchBookedUsers(initialData._id);
                } else {
                     // If not, check the backend for an active session
                    const res = await fetch("http://localhost:3000/api/admin/session", {
                        credentials: 'include' // Sends cookies
                    });
                    if (!res.ok) throw new Error("No active session");
                    const { admin } = await res.json();
                    
                    // If a session exists, fetch the full details and booked users
                    await fetchAdminDetails(admin._id);
                    await fetchBookedUsers(admin._id);
                }
            } catch (error) {
                console.warn("No active admin session found.");
                // If no session, adminData remains null, showing logged-out state.
            } finally {
                setIsLoading(false); // Stop the initial loading screen
            }
        };

        checkSession();
    }, [location.state, fetchAdminDetails, fetchBookedUsers]);


    const handleUpdateSlot = async (formData) => {
        if (!editingSlot || !adminData) return;
        setIsUpdating(true);
        try {
            // NOTE: Your backend seems to be missing a dedicated route for updating a slot's time/total.
            // This is a placeholder for where that request would go.
            // Example route: /api/admin/slot/update
            alert("Backend route for updating a slot does not exist yet.");
            // ... fetch request here ...
        } catch (err) {
            clipAct(err.message || "Server error. Could not update slot.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddSlot = async (formData) => {
        if (!adminData) return;
        setIsAdding(true);
        try {
            const res = await fetch("http://localhost:3000/api/admin/slot/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({
                    time: formData.time,
                    totalSlots: formData.totalSlots,
                    adminId: adminData._id,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add slot");

            // Update state locally for immediate feedback
            setAdminData(prevData => ({
                ...prevData,
                slotData: [...prevData.slotData, data.newSlot],
            }));
            clipAct("New slot added successfully!");
            setAddingNewSlot(false);
        } catch (err) {
            clipAct(err.message || "Server error. Could not add new slot.");
        } finally {
            setIsAdding(false);
        }
    };
    
    const handleRemoveBooking = async (userId) => {
        // NOTE: Backend route for this action appears to be missing.
        // This is a placeholder. You would need a route like:
        // DELETE /api/admin/booking/remove
        alert("Backend route for removing a booking does not exist yet.");
        // ... fetch request logic ...
    };

    if (isLoading) {
        return (
            <div className="h-screen flex justify-center items-center text-xl text-gray-700 bg-gray-100">
                Checking session...
            </div>
        );
    }

    if (!adminData) {
        return (
            <div className="h-screen flex flex-col justify-center items-center text-xl text-gray-700 bg-gray-100">
                <p>You are not logged in.</p>
                <p className="text-sm mt-2">Please sign in to view the admin dashboard.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8 relative">
             <button
                onClick={handleLogout}
                className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition text-sm cursor-pointer z-50"
            >
                Logout
            </button>
            
            <div className="bg-[#FFFDD0] p-8 rounded-xl shadow-lg w-full max-w-2xl text-gray-800">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-blue-700 text-center sm:text-left">Admin Dashboard</h1>
                    <div className="flex justify-center space-x-2">
                        <button onClick={() => setAddingNewSlot(true)} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition text-sm sm:text-base cursor-pointer">
                            + Add New Slot
                        </button>
                        <button onClick={() => setShowBookedUsersPopup(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition text-sm sm:text-base cursor-pointer">
                            View Consumers
                        </button>
                    </div>
                </div>

                <div className="mb-6 space-y-2 text-lg">
                    <p><span className="font-semibold text-blue-600">Owner Name:</span> {adminData.name}</p>
                    <p><span className="font-semibold text-blue-600">Email:</span> {adminData.email}</p>
                    <p><span className="font-semibold text-blue-600">Address:</span> {adminData.address}</p>
                </div>
                
                <div className="mt-6 border-t border-gray-300 pt-6">
                    <h2 className="text-2xl font-bold mb-4 text-blue-700">Available Slots</h2>
                    {adminData.slotData?.length > 0 ? (
                        <div className="space-y-4">
                            {adminData.slotData.map((slot) => {
                                const slotsUsed = bookedUsers.filter(user => user.bookedSlotTime === slot.time).length;
                                return (
                                    <div key={slot._id} className="p-4 bg-yellow-50 rounded-lg shadow-sm">
                                        {editingSlot?._id === slot._id ? (
                                            <SlotForm
                                                slot={editingSlot}
                                                onSubmit={handleUpdateSlot}
                                                onCancel={() => setEditingSlot(null)}
                                                isLoading={isUpdating}
                                                submitText="Update"
                                                title="Edit Slot"
                                            />
                                        ) : (
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 flex-grow">
                                                    <p><span className="font-medium">Time:</span> {slot.time}</p>
                                                    <p><span className="font-medium">Used:</span> {slotsUsed}</p>
                                                    <p><span className="font-medium">Total:</span> {slot.totalSlots}</p>
                                                    <p><span className="font-medium">Free:</span> {slot.totalSlots - slotsUsed}</p>
                                                </div>
                                                <button onClick={() => setEditingSlot(slot)} className="mt-2 sm:mt-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer self-end sm:self-center">
                                                    Edit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-600">No slots have been created yet.</p>
                    )}

                    {addingNewSlot && (
                        <SlotForm
                            onSubmit={handleAddSlot}
                            onCancel={() => setAddingNewSlot(false)}
                            isLoading={isAdding}
                            submitText="Add Slot"
                            title="Add New Slot Details"
                        />
                    )}
                </div>
            </div>

            <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out bg-gray-800 text-white px-6 py-3 rounded-lg z-50 ${showPopup ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none"}`}>
                {clipMsg}
            </div>

            {showBookedUsersPopup && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-40 p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg relative">
                        <button onClick={() => setShowBookedUsersPopup(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl leading-none cursor-pointer">&times;</button>
                        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Booked Users</h2>
                        {isLoadingUsers ? (<p className="text-center">Loading...</p>) : bookedUsers.length > 0 ? (
                            <ul className="space-y-3 max-h-96 overflow-y-auto">
                                {bookedUsers.map((user) => (
                                    <li key={user._id} className="p-3 bg-blue-50 rounded-md shadow-sm flex justify-between items-center gap-4">
                                        <div className="cursor-pointer flex-grow" onClick={() => setSelectedUser(user)}>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <p className="text-sm">Booked: {user.bookedSlotTime}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBooking(user._id)}
                                            disabled={removingUserId === user._id}
                                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition disabled:opacity-50 text-sm"
                                        >
                                            {removingUserId === user._id ? '...' : 'Remove'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (<p className="text-center text-gray-500">No users have booked slots.</p>)}
                    </div>
                </div>
            )}

            {selectedUser && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex justify-center items-center z-40 p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-sm relative">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl leading-none cursor-pointer">&times;</button>
                        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">User Details</h2>
                        <div className="space-y-3 text-lg">
                             <p><span className="font-semibold">Name:</span> {selectedUser.name}</p>
                             <p><span className="font-semibold">Email:</span> {selectedUser.email}</p>
                             <p><span className="font-semibold">Slot:</span> {selectedUser.bookedSlotTime}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default After_Admin_Login;

