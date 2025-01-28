// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertMessage from "../Alert/AlertMessage";
import { AiOutlinePlus } from "react-icons/ai";
import {
  listSubjectsAPI,
  deleteSubjectAPI,
  updateSubjectAPI,
} from "../../services/attendance/attendanceService";
import DashboardNavbar from "../Navbar/DashboardNavbar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);

  // Fetch subjects when the component mounts
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await listSubjectsAPI();
        setSubjects(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data.");
      }
    };

    fetchSubjects();
  }, []); // Empty array to run once when the component mounts

  // Handle Delete
  const handleDelete = (id) => {
    if (id) {
      deleteSubjectAPI(id)
        .then((response) => {
          setSubjects(subjects.filter((subject) => subject._id !== id)); // Update the state after deletion
        })
        .catch((error) => {
          alert("Error deleting subject");
        });
    } else {
      alert("Invalid subject ID");
    }
  };

  // Handle Edit
  const handleEdit = (subject) => {
    if (!subject || !subject._id) {
      alert("Subject data is missing or invalid.");
      return;
    }

    // Redirect to `/add-subject` with the subject data
    navigate(`/add-subject/${subject._id}`);
  };

  const user = JSON.parse(localStorage.getItem("userInfo") || null);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Include the DashboardNavbar here */}
      <DashboardNavbar user={user} />

      <div className="flex gap-6 pt-16 mx-5 my-5 flex-1">
        {/* Sidebar */}
        <aside className="w-64 fixed top-16 left-0 bg-gray-900 p-5">
          <div className="mt-8">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                <img src=".src/images/profile-1.jpg" alt="Profile" />
              </div>
              <div className="text-sm">
                <p className="font-semibold">
                  Hey, <b>{user.username}</b>
                </p>
                <small className="text-muted">{user.regnum}</small>
              </div>
            </div>
            <div className="mt-6">
              <h5 className="font-medium">Course</h5>
              <p>{user.course}</p>
              <h5 className="font-medium">DOB</h5>
              <p>{user.DOB}</p>
              <h5 className="font-medium">Contact</h5>
              <p>{user.mobileNo}</p>
              <h5 className="font-medium">Email</h5>
              <p>{user.email}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 mt-6 pl-72 bg-gray-900">
          <h1 className="text-2xl font-extrabold">Attendance</h1>

          {error && <p className="text-red-500">{error}</p>}

          <div className="grid grid-cols-5 gap-6 mt-4 text-black">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-none transition duration-300"
              >
                <span className="text-lg bg-blue-500 text-white rounded-full p-2">
                  Credit: {subject.credit}
                </span>

                <h3 className="mt-4 text-lg font-medium">{subject.subject}</h3>
                <h2 className="mt-2 text-xl font-semibold">
                  {`${subject.attendedClasses}/${subject.totalClasses}`}
                </h2>

                <div className="relative mt-4 w-20 h-20 mx-auto">
                  <svg className="w-full h-full">
                    <circle
                      cx="38"
                      cy="38"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 36}
                      strokeDashoffset={2 * Math.PI * 36 * ((100 - (subject.attendedClasses / subject.totalClasses) * 100) / 100)}
                    />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <p className="font-bold">{`${((subject.attendedClasses / subject.totalClasses) * 100).toFixed(0)}%`}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    key={subject._id}
                    onClick={() => handleEdit(subject)}
                    className="bg-yellow-500 text-white text-sm  px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(subject._id)}
                    className="bg-red-500 text-white text-sm px-2 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </div>

                <small className="text-muted block mt-2">Last Updated</small>
              </div>
            ))}

            <div
              className="bg-white/50 p-6 rounded-2xl shadow-lg hover:shadow-none transition duration-300 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => console.log("Add new subject")}
            >
              <Link to="/add-subject">
                <AiOutlinePlus className="text-black text-4xl" />
                <h3 className="mt-4 text-lg font-medium text-black-500">
                  Add Subject
                </h3>
              </Link>
            </div>
          </div>
        </main>
      </div>

      <AlertMessage />
    </div>
  );
};

export default Dashboard;
