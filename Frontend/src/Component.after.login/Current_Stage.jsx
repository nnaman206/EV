import React, { useState, useEffect, useRef, useMemo, memo, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// --- API call functions using the provided backend endpoints ---

const fetchAddresses = async (address, signal) => {
    let retries = 0;
    const maxRetries = 5;
    let delay = 1000;

    while (retries < maxRetries) {
        try {
            const response = await fetch(`http://localhost:3000/api/admins/address?address=${encodeURIComponent(address)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                signal,
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 429) {
                    retries++;
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                    continue;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch city data");
            }
            return response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw error;
            }
            console.error("Fetch Addresses Error:", error);
            retries++;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
    throw new Error("Failed to fetch addresses after multiple retries.");
};

const fetchStationDetails = async (stationId) => {
    let retries = 0;
    const maxRetries = 5;
    let delay = 1000;

    while (retries < maxRetries) {
        try {
            const res = await fetch(`http://localhost:3000/api/admins/station/${encodeURIComponent(stationId)}`, {
                credentials: 'include'
            });

            if (!res.ok) {
                if (res.status === 429) {
                    retries++;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                    continue;
                }
                throw new Error(`Failed to fetch station details: ${res.status} ${res.statusText}`);
            }
            return await res.json();
        } catch (error) {
            console.error(`Fetch Station Details Error (attempt ${retries + 1}):`, error);
            retries++;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    throw new Error("Failed to fetch station details after multiple retries.");
};

const bookSlotApi = async (data) => {
    const { user, selectedStation, selectedSlot } = data;
    const [slotTimePart] = selectedSlot.split('-Slot-');

    const bookedSlotObject = selectedStation.slotData.find(s => s.time === slotTimePart);
    if (!bookedSlotObject || !bookedSlotObject._id) {
        throw new Error("Error: Selected slot details or ID not found in station's slotData.");
    }
    const slotDbId = bookedSlotObject._id;

    let retries = 0;
    const maxRetries = 5;
    let delay = 1000;

    while (retries < maxRetries) {
        try {
            const userUpdateResponse = await fetch(
                `http://localhost:3000/api/user/update/${encodeURIComponent(user.userId)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        stationName: selectedStation.name,
                        stationAddress: selectedStation.address,
                        time: slotTimePart,
                        slotNumber: selectedSlot,
                        stationId: selectedStation._id
                    }),
                    credentials: 'include'
                }
            );
            if (!userUpdateResponse.ok) {
                if (userUpdateResponse.status === 429) {
                    retries++;
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                    continue;
                }
                let errorData = {};
                try {
                    errorData = await userUpdateResponse.json();
                } catch {}
                throw new Error(errorData.message || "Failed to update user booking");
            }

            const adminSlotBookingResponse = await fetch(
                `http://localhost:3000/api/admin/update/slot/${encodeURIComponent(selectedStation._id)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        slotId: slotDbId,
                        userId: user.userId,
                        userName: user.name,
                        slotNumber: selectedSlot
                    }),
                    credentials: 'include'
                }
            );
            if (!adminSlotBookingResponse.ok) {
                if (adminSlotBookingResponse.status === 429) {
                    retries++;
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                    continue;
                }
                let errorData = {};
                try {
                    errorData = await adminSlotBookingResponse.json();
                } catch {}
                throw new Error(errorData.message || "Failed to update admin's slot booking status.");
            }

            const userDataResponse = await userUpdateResponse.json();

            if (!userDataResponse.bookingId) {
                throw new Error("Backend did not return a valid booking ID.");
            }

            return {
                ...userDataResponse,
                bookedSlotTime: slotTimePart,
                slotNumber: selectedSlot,
                bookedByUserName: user.name,
                stationId: selectedStation._id,
                bookingId: userDataResponse.bookingId,
                stationName: selectedStation.name,
                stationAddress: selectedStation.address
            };

        } catch (error) {
            console.error("Book Slot API Error:", error.message);
            retries++;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
    throw new Error("Failed to book slot after multiple retries.");
};

const fetchUserDetailsFromBackend = async () => {
    let retries = 0;
    const maxRetries = 5;
    let delay = 1000;

    while (retries < maxRetries) {
        try {
            const response = await fetch(
                `http://localhost:3000/api/user/details`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.status === 401) {
                return null;
            }
            if (!response.ok) {
                if (response.status === 429) {
                    retries++;
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                    continue;
                }
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch {}
                throw new Error(errorData.message || "Failed to fetch user details");
            }
            return await response.json();
        } catch (error) {
            console.error("Fetch User Details Error:", error.message);
            retries++;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
    throw new Error("Failed to fetch user details after multiple retries.");
};

const deleteUserBookingApi = async (data) => {
    const { userId, bookingId, stationId, slotNumber } = data;
    const [slotTimePart] = slotNumber.split('-Slot-');
    const maxRetries = 5;
    let delay = 1000;

    const retryFetch = async (url, options, action) => {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                const res = await fetch(url, options);
                if (!res.ok) {
                    if (res.status === 429) {
                        retries++;
                        await new Promise(res => setTimeout(res, delay));
                        delay *= 2;
                        continue;
                    }
                    let errorMessage = `Failed to ${action}`;
                    try {
                        const errorData = await res.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        const errorText = await res.text();
                        errorMessage = errorText || errorMessage;
                    }
                    throw new Error(errorMessage);
                }
                return res.json().catch(() => ({}));
            } catch (err) {
                console.error(`${action} Error:`, err);
                retries++;
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            }
        }
        throw new Error(`Failed to ${action} after multiple retries`);
    };

    await retryFetch(
        `http://localhost:3000/api/user/booking/${encodeURIComponent(userId)}/${encodeURIComponent(bookingId)}`,
        {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stationId, slotNumber, time: slotTimePart }),
            credentials: 'include'
        },
        "delete user booking"
    );

    await retryFetch(
        `http://localhost:3000/api/admin/update/slot/free/${encodeURIComponent(stationId)}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slotNumber, time: slotTimePart }),
            credentials: 'include'
        },
        "free admin slot"
    );

    console.log(`Booking ${bookingId} for user ${userId} at station ${stationId} (slot ${slotNumber}) deleted.`);
    return { success: true, bookingId, userId, stationId, slotNumber };
};

// Reducer for managing booking state
const bookingReducer = (state, action) => {
    switch (action.type) {
        case 'SELECT_STATION':
            return {
                ...state,
                selectedStation: action.payload,
                selectedSlot: '',
                bookingStatus: ''
            };
        case 'SELECT_SLOT':
            return {
                ...state,
                selectedSlot: action.payload,
                bookingStatus: ''
            };
        case 'SET_BOOKING_STATUS':
            return {
                ...state,
                bookingStatus: action.payload
            };
        case 'SET_USER_BOOKING':
            return {
                ...state,
                userBooking: action.payload,
                bookingStatus: '✅ Booking confirmed!'
            };
        case 'CLEAR_BOOKING':
            return {
                ...state,
                userBooking: null,
                bookingStatus: action.payload
            };
        case 'RESET_BOOKING_POPUP':
            return {
                ...state,
                selectedStation: null,
                selectedSlot: '',
                bookingStatus: ''
            };
        case 'RESET_ALL':
            return {
                selectedStation: null,
                selectedSlot: '',
                userBooking: null,
                bookingStatus: ''
            };
        default:
            return state;
    }
};

const SearchResults = memo(({ searchResult, onStationSelect, selectedStationId }) => {
    if (!searchResult || searchResult.length === 0) {
        return <p className="text-gray-500 text-center w-full">No matching addresses found or start your search.</p>;
    }
    return (
        <ul className="space-y-2 w-full">
            {searchResult.map((station) => (
                <li
                    key={station._id}
                    className={`bg-white p-3 rounded-lg shadow-sm border ${
                        selectedStationId === station._id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                    } hover:bg-blue-50 transition cursor-pointer`}
                    onClick={() => onStationSelect(station._id)}
                >
                    <span className="font-semibold">{station.name}</span> - {station.address}
                </li>
            ))}
        </ul>
    );
});

function Current_Stage() {
    const navigate = useNavigate();
    const { id: userIdFromRoute } = useParams();

    const [loggedInUser, setLoggedInUser] = useState({ name: "Guest User", userId: userIdFromRoute || null });
    const [address, setAddress] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const addressRef = useRef(null);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(true);
    
    // --- New ref for Google Autocomplete instance ---
    const autocomplete = useRef(null);

    const [bookingState, dispatch] = useReducer(bookingReducer, {
        selectedStation: null,
        selectedSlot: '',
        userBooking: null,
        bookingStatus: ''
    });
    
    // --- New handler for manual and autocomplete searches ---
    const handleSearch = async (searchAddress) => {
        if (!searchAddress) return;
        
        setLoading(true);
        const controller = new AbortController();
        const signal = controller.signal;

        try {
            const data = await fetchAddresses(searchAddress, signal);
            if (data.addresses && Array.isArray(data.addresses)) {
                setSearchResult(data.addresses);
                if (data.addresses.length === 0) {
                    dispatch({ type: 'SET_BOOKING_STATUS', payload: 'No matching addresses found.' });
                } else {
                    dispatch({ type: 'SET_BOOKING_STATUS', payload: '' });
                }
            } else {
                setSearchResult([]);
                dispatch({ type: 'SET_BOOKING_STATUS', payload: 'No matching addresses found.' });
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error("Error fetching data:", error);
            dispatch({ type: 'SET_BOOKING_STATUS', payload: `Error: ${error.message || 'Please try again later.'}` });
        } finally {
            setLoading(false);
        }
    };

    // --- New useEffect to initialize Google Places Autocomplete ---
    useEffect(() => {
        // Ensure Google Maps script is loaded and the ref is attached to the input
        if (window.google && addressRef.current && !autocomplete.current) {
            autocomplete.current = new window.google.maps.places.Autocomplete(addressRef.current, {
                types: ['geocode'], // Restrict to geographical locations
                componentRestrictions: { 'country': 'in' }, // Restrict to India (optional)
                fields: ['formatted_address'] // Ask only for the data we need
            });

            // Add listener for when a user selects an address from the dropdown
            autocomplete.current.addListener("place_changed", () => {
                const place = autocomplete.current.getPlace();
                if (place && place.formatted_address) {
                    setAddress(place.formatted_address);
                    handleSearch(place.formatted_address); // Trigger search when a place is selected
                }
            });
        }
    }, []); // Run this effect only once on component mount

    // Effect for Initial User Load and Fetching User Details
    useEffect(() => {
        let isMounted = true;

        const initializeUser = async () => {
            setIsUserLoading(true);
            try {
                let freshUserDetails = null;
                freshUserDetails = await fetchUserDetailsFromBackend();

                if (!isMounted) return;

                if (freshUserDetails && freshUserDetails.user) {
                    setLoggedInUser({ name: freshUserDetails.user.name, userId: freshUserDetails.user._id });

                    if (freshUserDetails.user.currentBooking) {
                        dispatch({
                            type: 'SET_USER_BOOKING',
                            payload: { ...freshUserDetails.user.currentBooking, bookedByUserName: freshUserDetails.user.name, userId: freshUserDetails.user._id, bookingId: freshUserDetails.user.currentBooking._id }
                        });
                    } else {
                        dispatch({ type: 'CLEAR_BOOKING', payload: "No active booking found." });
                    }
                } else {
                    setLoggedInUser({ name: "Guest User", userId: null });
                    dispatch({ type: 'RESET_ALL' });
                }
            } catch (error) {
                if (!isMounted) return;
                console.error("Error initializing user from backend:", error);
                dispatch({ type: 'SET_BOOKING_STATUS', payload: `Error loading user: ${error.message}` });
                setLoggedInUser({ name: "Guest User", userId: null });
            } finally {
                if (isMounted) {
                    setIsUserLoading(false);
                }
            }
        };

        initializeUser();

        return () => {
            isMounted = false;
        };
    }, [userIdFromRoute]);

    const handleStationSelect = async (stationId) => {
        try {
            const fullData = await fetchStationDetails(stationId);
            dispatch({ type: 'SELECT_STATION', payload: fullData });
        } catch (err) {
            console.error("Error fetching station details:", err);
            dispatch({ type: 'SET_BOOKING_STATUS', payload: "Error fetching station details. Please try again." });
        }
    };

    const handleSlotBooking = async () => {
        if (isUserLoading || !loggedInUser || !loggedInUser.userId) {
            dispatch({ type: 'SET_BOOKING_STATUS', payload: "Please log in to book a slot." });
            return;
        }
        if (!bookingState.selectedSlot) {
            dispatch({ type: 'SET_BOOKING_STATUS', payload: "Please select a slot before booking." });
            return;
        }
        if (!bookingState.selectedStation) {
            dispatch({ type: 'SET_BOOKING_STATUS', payload: "No station selected for booking." });
            return;
        }
        const [slotTimePart] = bookingState.selectedSlot.split('-Slot-');
        const currentSlotDetails = bookingState.selectedStation.slotData.find(s => s.time === slotTimePart);

        if (currentSlotDetails && currentSlotDetails.bookedSlots && currentSlotDetails.bookedSlots.some(b => b.slotNumber === bookingState.selectedSlot)) {
            dispatch({ type: 'SET_BOOKING_STATUS', payload: "This slot is no longer available. Please select another." });
            return;
        }

        setBookingLoading(true);
        try {
            const bookingData = await bookSlotApi({
                user: loggedInUser,
                selectedStation: bookingState.selectedStation,
                selectedSlot: bookingState.selectedSlot
            });
            dispatch({ type: 'SET_USER_BOOKING', payload: bookingData });

            const updatedStationDetails = await fetchStationDetails(bookingState.selectedStation._id);
            dispatch({ type: 'SELECT_STATION', payload: updatedStationDetails });
        } catch (error) {
            console.error("Error booking slot:", error);
            dispatch({ type: 'SET_BOOKING_STATUS', payload: `❌ Failed to book slot: ${error.message || 'Please try again.'}` });
        } finally {
            setBookingLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/user/logout", {
                method: "POST",
                credentials: 'include'
            });

            if (response.ok) {
                dispatch({ type: 'RESET_ALL' });
                setLoggedInUser({ name: "Guest User", userId: null });
                navigate('/login');
            } else {
                console.error("Logout failed:", await response.text());
                dispatch({ type: 'SET_BOOKING_STATUS', payload: "Failed to log out. Please try again." });
            }
        } catch (error) {
            console.error("Logout error:", error);
            dispatch({ type: 'SET_BOOKING_STATUS', payload: "Server error during logout. Please try again." });
        }
    };

    const handleClearBooking = async () => {
        if (!loggedInUser.userId || !bookingState.userBooking) {
            dispatch({ type: 'SET_BOOKING_STATUS', payload: "No active booking to delete." });
            return;
        }

        setBookingLoading(true);
        try {
            await deleteUserBookingApi({
                userId: loggedInUser.userId,
                bookingId: bookingState.userBooking.bookingId,
                stationId: bookingState.userBooking.stationId,
                slotNumber: bookingState.userBooking.slotNumber
            });
            dispatch({ type: 'CLEAR_BOOKING', payload: "Your booking has been cleared." });

            if (bookingState.selectedStation && bookingState.userBooking.stationId === bookingState.selectedStation._id) {
                const updatedStationDetails = await fetchStationDetails(bookingState.selectedStation._id);
                dispatch({ type: 'SELECT_STATION', payload: updatedStationDetails });
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            dispatch({ type: 'SET_BOOKING_STATUS', payload: `❌ Failed to delete booking: ${error.message || 'Please try again.'}` });
        } finally {
            setBookingLoading(false);
        }
    };

    const memoizedSearchResults = useMemo(() => (
        <SearchResults
            searchResult={searchResult}
            onStationSelect={handleStationSelect}
            selectedStationId={bookingState.selectedStation?._id}
        />
    ), [searchResult, bookingState.selectedStation?._id]);

    const bookingStatusColorClass = bookingState.bookingStatus.startsWith('✅') ? 'text-green-700 bg-green-50' :
        bookingState.bookingStatus.startsWith('❌') ? 'text-red-700 bg-red-50' :
            'text-gray-600 bg-gray-50';

    if (isUserLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans bg-gradient-to-br from-blue-50 to-white">
                <div className="flex flex-col items-center justify-center bg-white p-12 rounded-xl shadow-lg animate-pulse">
                    <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xl text-gray-700 font-medium">Loading user session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans bg-gradient-to-br from-blue-50 to-white">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 w-full max-w-7xl mx-auto my-4 overflow-hidden relative">
                <div className="absolute top-4 right-4 flex space-x-2">
                    {loggedInUser.userId ? (
                        <button
                            onClick={() => setShowProfilePopup(true)}
                            className="relative text-3xl text-gray-700 hover:text-purple-600 z-10 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="User Profile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                            {bookingState.userBooking && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            Login
                        </button>
                    )}
                </div>
                <main className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                            Welcome To EV Charger Allocator
                        </h2>
                        <p className="text-md sm:text-lg text-gray-500 mb-8 max-w-md mx-auto lg:mx-0">
                            Future EV charging stations will combine sustainability with convenience for greener transportation.
                        </p>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-600 mb-4 flex items-center justify-center lg:justify-start">
                                <span className="text-yellow-500 text-lg mr-2">🌟</span>
                                One charger, one ride, one choice—together we change the world.
                            </p>
                            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); handleSearch(address); }}>
                                <input
                                    type="text"
                                    placeholder="Enter City or Address"
                                    className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    ref={addressRef}
                                />
                                <button
                                    type="submit"
                                    className="bg-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                    <span className="ml-1">→</span>
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="flex-1 relative flex flex-col justify-start items-start h-64 sm:h-80 lg:h-auto lg:min-h-[400px] w-full lg:w-auto overflow-y-auto p-4 border rounded-lg bg-gray-50">
                        {loading && <p className="text-gray-500 text-center w-full">Loading addresses...</p>}
                        {!loading && memoizedSearchResults}
                    </div>
                </main>
            </div>
            {/* Station Details & Booking Popup */}
            {bookingState.selectedStation && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">{bookingState.selectedStation.name}</h3>
                        <p className="text-gray-600 mb-4">{bookingState.selectedStation.address}</p>
                        <p className="mb-2 text-gray-700">🕒 Operational Time: <span className="font-medium">{bookingState.selectedStation.time || 'N/A'}</span></p>
                        <p className="mb-4 text-gray-700">⚡ Total Slots Available: <span className="font-medium">{bookingState.selectedStation.slotData?.reduce((acc, slot) => acc + slot.totalSlots, 0) || 'N/A'}</span></p>
                        <label htmlFor="slot-select" className="block mb-2 text-gray-700 font-medium">Select Slot:</label>
                        <select
                            id="slot-select"
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={bookingState.selectedSlot}
                            onChange={(e) => dispatch({ type: 'SELECT_SLOT', payload: e.target.value })}
                        >
                            <option value="">-- Choose a slot --</option>
                            {bookingState.selectedStation.slotData?.map((slotTime) => (
                                [...Array(slotTime.totalSlots)].map((_, i) => {
                                    const slotIdentifier = `${slotTime.time}-Slot-${i + 1}`;
                                    const isBooked = (slotTime.bookedSlots || []).some(
                                        booking => booking.slotNumber === slotIdentifier
                                    );
                                    const isBookedByCurrentUser = (bookingState.userBooking &&
                                        bookingState.userBooking.stationId === bookingState.selectedStation._id &&
                                        bookingState.userBooking.slotNumber === slotIdentifier
                                    );
                                    return (
                                        <option
                                            key={slotIdentifier}
                                            value={slotIdentifier}
                                            disabled={isBooked && !isBookedByCurrentUser}
                                            className={isBooked ? (isBookedByCurrentUser ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800') : ''}
                                        >
                                            {slotTime.time} - Slot {i + 1} {isBookedByCurrentUser ? '(Your Booking)' : (isBooked ? '(Booked)' : '')}
                                        </option>
                                    );
                                })
                            ))}
                        </select>
                        {bookingState.bookingStatus && (
                            <p className={`mb-4 text-sm text-center font-medium p-2 rounded-md ${bookingStatusColorClass}`}>
                                {bookingState.bookingStatus}
                            </p>
                        )}
                        <div className="flex justify-between flex-wrap gap-2">
                            <button
                                onClick={handleSlotBooking}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex-1 min-w-[100px] cursor-pointer transition-colors shadow-md"
                                disabled={!loggedInUser.userId || !bookingState.selectedSlot || bookingLoading}
                            >
                                {bookingLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Booking...
                                    </span>
                                ) : 'Book Slot'}
                            </button>
                            <a
                                href={`http://maps.google.com/?q=${encodeURIComponent(bookingState.selectedStation.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 flex-1 min-w-[100px] cursor-pointer transition-colors shadow-md"
                            >
                                View Route →
                            </a>
                            <button
                                onClick={() => dispatch({ type: 'RESET_BOOKING_POPUP' })}
                                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 flex-1 min-w-[100px] cursor-pointer transition-colors shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Profile Popup */}
            {showProfilePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Welcome, {loggedInUser.name}!</h3>
                        <p className="text-sm text-gray-600 mb-2">User ID: <span className="font-semibold break-all">{loggedInUser.userId || 'Not Logged In'}</span></p>
                        {bookingState.userBooking ? (
                            <>
                                <h4 className="font-semibold text-md mt-4 mb-2 text-gray-800">Your Active Booking:</h4>
                                <p className="text-sm text-gray-700">Station: <span className="font-semibold">{bookingState.userBooking.stationName || 'N/A'}</span></p>
                                <p className="text-sm text-gray-700">Address: <span className="font-semibold">{bookingState.userBooking.stationAddress || 'N/A'}</span></p>
                                <p className="text-sm text-gray-700">Booked Slot: <span className="font-semibold">{bookingState.userBooking.slotNumber || 'N/A'}</span></p>
                                <p className="text-sm text-gray-700 mb-4">Time: <span className="font-semibold">{bookingState.userBooking.time || 'N/A'}</span></p>
                                <div className="flex justify-between flex-wrap gap-2 mt-4">
                                    <button
                                        onClick={handleClearBooking}
                                        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex-1 min-w-[80px] cursor-pointer transition-colors shadow-md"
                                        disabled={bookingLoading}
                                    >
                                        {bookingLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Deleting...
                                            </span>
                                        ) : 'Delete Booking'}
                                    </button>
                                    <a
                                        href={`http://maps.google.com/?q=${encodeURIComponent(bookingState.userBooking.stationAddress || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center flex-1 min-w-[80px] cursor-pointer transition-colors shadow-md"
                                    >
                                        Map
                                    </a>
                                </div>
                            </>
                        ) : (
                            <p className="mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">No active slot booking found.</p>
                        )}
                        {bookingState.bookingStatus && (
                            <p className={`mb-4 text-sm text-center font-medium p-2 rounded-md ${bookingStatusColorClass}`}>
                                {bookingState.bookingStatus}
                            </p>
                        )}
                        <button
                            onClick={handleLogout}
                            className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer transition-colors shadow-md"
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => setShowProfilePopup(false)}
                            className="mt-2 w-full bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 cursor-pointer transition-colors shadow-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Current_Stage;
