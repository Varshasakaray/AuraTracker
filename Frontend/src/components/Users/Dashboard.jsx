import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import { FaBlackTie } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import {
  listSubjectsAPI,
  deleteSubjectAPI,
  updateSubjectAPI,
} from "../../services/attendance/attendanceService";

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
    console.log("Deleting subject with id:", id);
    if (id) {
      deleteSubjectAPI(id)
        .then((response) => {
          console.log("Subject deleted", response);
          setSubjects(subjects.filter((subject) => subject._id !== id)); // Update the state after deletion
        })
        .catch((error) => {
          console.error("Error deleting subject:", error.message);
          alert("Error deleting subject");
        });
    } else {
      console.error("No valid id provided to delete subject");
      alert("Invalid subject ID");
    }
  };

  // Handle Edit
  const handleEdit = (subject) => {
    if (!subject || !subject._id) {
      console.error("Invalid subject data:", subject);
      alert("Subject data is missing or invalid.");
      return;
    }

    // Redirect to `/add-subject` with the subject data
    navigate(`/add-subject/${subject._id}`);
  };

  const user = JSON.parse(localStorage.getItem("userInfo") || null);
  console.log(user);

  return (
    <div className="relative bg-gray-900 text-white">
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
              onClick={() => timeTableAll()}
            >
              <h3>Time Table</h3>
            </Link>
            <Link
              to="/examdashboard"
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
              to="/logout"
              className="mx-4 text-sm font-semibold hover:text-blue-600"
            >
              <h3>Logout</h3>
            </Link>
          </nav>
          <div className="flex items-center cursor-pointer">
            <span className="material-icons-sharp">person</span>
          </div>
          <div className="flex items-center bg-gray-200 p-2 rounded-full ml-4 cursor-pointer">
            <span className="material-icons-sharp text-sm">light_mode</span>
            <span className="material-icons-sharp text-sm">dark_mode</span>
          </div>
        </div>
      </header>

      <div className="flex gap-6 pt-16 mx-5 my-5">
        <aside className="w-64 fixed top-16">
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

        <main className="flex-1 mt-6 pl-72">
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
                      strokeDashoffset={
                        2 *
                        Math.PI *
                        36 *
                        ((100 -
                          (subject.attendedClasses / subject.totalClasses) *
                            100) /
                          100)
                      }
                    />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <p className="font-bold">{`${(
                      (subject.attendedClasses / subject.totalClasses) *
                      100
                    ).toFixed(0)}%`}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  {/* Edit Button */}
                  <button
                    key={subject._id}
                    onClick={() => handleEdit(subject)}
                    className="bg-yellow-500 text-white text-sm  px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition duration-300"
                  >
                    Edit
                  </button>

                  {/* Delete Button */}
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
          <div className="mt-8">
            <div className="flex justify-between items-center">
              <span className="cursor-pointer text-xl" id="prevDay">
                &lt;
              </span>
              <h2 className="text-lg font-semibold">Today's Timetable</h2>
              <span className="cursor-pointer text-xl" id="nextDay">
                &gt;
              </span>
            </div>
            <span
              className="bg-red-500 text-white p-2 rounded-full absolute top-0 right-0 mt-6 cursor-pointer"
              onClick={() => timeTableAll()}
            >
              X
            </span>
            <table className="mt-4 w-full bg-white rounded-xl shadow-lg ">
              <thead className="text-black">
                <tr>
                  <th className="text-left p-4">Time</th>
                  <th className="text-left p-4">Room No.</th>
                  <th className="text-left p-4">Subject</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </main>
        <div className="w-72">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-black">Announcements</h2>
            <div className="space-y-4 mt-4 text-black">
              {[
                {
                  type: "Academic",
                  message: "Summer training internship with Live Projects.",
                  time: "2 Minutes Ago",
                },
                {
                  type: "Co-curricular",
                  message:
                    "Global internship opportunity by Student organization.",
                  time: "10 Minutes Ago",
                },
                {
                  type: "Examination",
                  message: "Instructions for Mid Term Examination.",
                  time: "Yesterday",
                },
              ].map((update, index) => (
                <div key={index} className="flex items-center justify-between">
                  <p>
                    <b>{update.type}</b> {update.message}
                  </p>
                  <small className="text-muted">{update.time}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 mt-8 rounded-xl shadow-lg text-black">
            <h2 className="text-xl font-semibold">Teachers on leave</h2>
            <div className="space-y-4 mt-4">
              {[
                {
                  name: "The Professor",
                  status: "Full Day",
                  img: ".src/images/profile-2.jpeg",
                },
                {
                  name: "Lisa Manobal",
                  status: "Half Day",
                  img: ".src/images/profile-3.jpg",
                },
                {
                  name: "Himanshu Jindal",
                  status: "Full Day",
                  img: ".src/images/profile-4.jpg",
                },
              ].map((teacher, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src={teacher.img} alt={teacher.name} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{teacher.name}</h3>
                    <small className="text-muted">{teacher.status}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertMessage />
    </div>
  );
};

export default Dashboard;
