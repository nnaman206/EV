import React from "react";
import sample3 from "./assets/sample3.jpg";
import image from "./assets/image right.png";
import { MdLocationSearching } from "react-icons/md";
import { GrMapLocation } from "react-icons/gr";
import { GrSelection } from "react-icons/gr";

function HomePage() {
  return (
    <div
      className="bg-cover bg-no-repeat min-h-screen"
      style={{ backgroundImage: `url(${sample3})` }}
    >
      <div className="min-h-screen">
        {/* Header */}
        

        {/* Main Section */}
        <div
          className="flex flex-col lg:flex-row justify-between items-center px-10 lg:px-20 py-10"
          
        >
          {/* Left Content */}
          <div className="text-white max-w-xl mb-10 lg:mb-0">
            <h1 className="text-5xl font-bold text-black leading-tight">
              Find Then Get
            </h1>
            <h1 className="text-5xl font-bold leading-tight mt-1 text-black">
              <span className="text-green-500">Charge</span> Your Car Fast
            </h1>

            <p className="text-lg mt-4 text-black">
              Put an end to range anxiety. Find charging stations in seconds and
              keep your plans on track with real-time availability updates.
            </p>

            <div className="mt-8 flex space-x-16">
              <div>
                <p className="text-4xl font-bold text-black">230+</p>
                <p className="text-xl text-black">Charging Station</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-black">50+</p>
                <p className="text-xl text-black">Cities</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div>
            <img
              src={image}
              alt="EV Charging"
              className="w-[500px] rounded-lg shadow-xl"
            />
          </div>
        </div>

        {/* How it Works Section */}
        <div className="py-16 text-center">
          <h1 className="text-4xl font-bold text-black mb-12">How It Works?</h1>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 px-4">
            {/* Card 1 */}
            <div className="border border-black-300 rounded-xl p-6 w-72 shadow-lg h-full flex flex-col items-start">
              <MdLocationSearching className="text-black text-3xl mb-4" />
              <p className="font-bold text-lg text-start">
                Login and Search For the Station name
              </p>
              <p className="text-sm mt-2 text-gray-700 font-semibold text-start">
                Plan long road trips confidently with our smart EV charger planner.
              </p>
            </div>

            {/* Card 2 */}
            <div className="border border-black-300 rounded-xl p-6 w-72 shadow-lg h-full flex flex-col items-start">
              <GrMapLocation className="text-black text-3xl mb-4" />
              <p className="font-bold text-lg text-start">
                Find the nearest location point
              </p>
              <p className="text-sm mt-2 text-gray-700 font-semibold text-start">
                Quickly find the nearest EV charging station with real-time location tracking.
              </p>
            </div>

            {/* Card 3 */}
            <div className="border border-black-300 rounded-xl p-6 w-72 shadow-lg h-full flex flex-col items-start">
              <GrSelection className="text-black text-3xl mb-4" />
              <p className="font-bold text-lg text-start">
                Select the slot and Follow the path on the map
              </p>
              <p className="text-sm mt-2 text-gray-700 font-semibold text-start">
                Select your charging slot and follow the guided path on the map. 🚗⚡
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
