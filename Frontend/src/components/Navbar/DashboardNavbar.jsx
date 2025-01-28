// src/components/DashboardNavbar.js
import React from "react";
import { Link } from "react-router-dom";
import { FaBlackTie } from "react-icons/fa";

const DashboardNavbar = ({ user }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-10 bg-white shadow-lg text-black">
      <div className="flex items-center p-4 gap-3">
        <div className="flex items-center gap-2 mr-auto">
          <img
            src=".src/images/logo.png"
            alt="University Logo"
            className="w-8 h-8"
          />
          <h2>
            U<span className="text-red-400">M</span>S
          </h2>
        </div>
        <nav className="flex items-center ml-auto">
          <Link
            to="/profile"
            className="mx-4 text-sm font-semibold hover:text-blue-600"
          >
            <h3>Home</h3>
          </Link>
          <Link
            to="/timetable"
            className="mx-4 text-sm font-semibold hover:text-blue-600"
          >
            <h3>Time Table</h3>
          </Link>
          <Link
            to="/exam-dashboard"
            className="mx-4 text-sm font-semibold hover:text-blue-600"
          >
            <h3>Examination</h3>
          </Link>
          <Link
            to="/profile"
            className="mx-4 text-sm font-semibold hover:text-blue-600"
          >
            <h3>Change Password</h3>
          </Link>
          <Link
            to="/dashboard"
            className="mx-4 text-sm font-semibold hover:text-blue-600"
          >Dashboard</Link>
          <Link
            to="/logout"
            className="mx-4 text-sm font-semibold hover:text-blue-600"
          >
            <h3>Logout</h3>
          </Link>
        </nav>
        <div className="flex items-center bg-gray-200 p-2 rounded-full ml-4 cursor-pointer">
          <span className="material-icons-sharp text-sm">light_mode</span>
          <span className="material-icons-sharp text-sm">dark_mode</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
