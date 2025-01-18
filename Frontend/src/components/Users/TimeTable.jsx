import React from "react";
import { Link } from "react-router-dom";

function StudentDashboard() {
  return (
    <div>
      <header>
        <div className="logo">
          <img src="./images/logo.png" alt="Logo" />
          <h2>
            U<span className="danger">M</span>S
          </h2>
        </div>
        <div className="navbar">
          <Link to="/dashboard">
            <h3>Home</h3>
          </Link>
          <Link
            to="/timetable"
            className="active"
            onClick={() => timeTableAll()}
          >
            <h3>Time Table</h3>
          </Link>
          <Link to="/examdashboard">
            <h3>Examination</h3>
          </Link>
          <Link to="/password">
            <h3>Change Password</h3>
          </Link>
          <Link to="/logout">
            <h3>Logout</h3>
          </Link>
        </div>
        <div id="profile-btn" style={{ display: "none" }}>
          <span className="material-icons-sharp">person</span>
        </div>
        <div className="theme-toggler">
          <span className="material-icons-sharp active">light_mode</span>
          <span className="material-icons-sharp">dark_mode</span>
        </div>
      </header>

      <main style={{ margin: 0 }}>
        <div className="timetable active" id="timetable">
          <div>
            <span id="prevDay">&lt;</span>
            <h2>Today's Timetable</h2>
            <span id="nextDay">&gt;</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Room No.</th>
                <th>Subject</th>
                <th></th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </main>
      <script src="./services/timetable/timeTable.js"></script>
      <script src="./services/dashboard/app.js"></script>
    </div>
  );
}

export default StudentDashboard;
