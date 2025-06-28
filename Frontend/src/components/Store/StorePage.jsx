import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { missions } from "./Missions";

const StorePage = () => {
  const navigate = useNavigate();
  const [completedMissions, setCompletedMissions] = useState({});

  // Check mission completion
  const checkCompletedMissions = () => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    const userKey = user?.email || "guest";
    const today = new Date().toISOString().slice(0, 10);
    const status = {};
    missions.forEach((mission) => {
      const key = `${mission.key}_${userKey}_${today}`;
      status[mission.key] = localStorage.getItem(key) === "true";
    });
    setCompletedMissions(status);
  };

  useEffect(() => {
    checkCompletedMissions(); // Run on mount

    // Re-run on page focus
    window.addEventListener("focus", checkCompletedMissions);
    return () => window.removeEventListener("focus", checkCompletedMissions);
  }, []);

  const handleMissionClick = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white py-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold">Check-in Missions</h1>
        <p className="mt-2 text-gray-500">
          Earn points by completing these missions!
        </p>
      </div>
      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {missions.map((mission, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-2xl transform transition hover:-translate-y-1"
          >
            <div className="text-yellow-500 text-5xl mb-3">🪙</div>
            <p className="text-lg font-semibold">{mission.title}</p>
            <p className="text-yellow-500 font-bold text-2xl mt-2">
              {mission.points}
            </p>
            {completedMissions[mission.key] ? (
              <button
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-xl cursor-default"
                disabled
              >
                ✅ Completed
              </button>
            ) : (
              <button
                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600"
                onClick={() => handleMissionClick(mission.path)}
              >
                Go to mission ➡️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorePage;
