  import { BrowserRouter, Route, Routes } from "react-router-dom";
  import HeroSection from "./components/Home/HomePage";
  import PublicNavbar from "./components/Navbar/PublicNavbar";
  import RegistrationForm from "./components/Users/Register";
  import LoginForm from "./components/Users/Login";
  import PrivateNavbar from "./components/Navbar/PrivateNavbar";
  import { getUserFromStorage } from "./utils/getUserFromStorage";
  import { useSelector } from "react-redux";
  import UserProfile from "./components/Users/UserProfile";
  import AuthRoute from "./components/Auth/AuthRoute";
  import AddTask from "./components/Task/AddTask";
  import TasksList from "./components/Task/TasksList";
  import UpdateTask from "./components/Task/UpdateTask";
  import Dashboard from "./components/Users/Dashboard";
  import ExamDashboard from "./components/Users/Exam";
  import AssignmentHeader from "./components/Header/AssignmentHeader";
  import ClassRoomLogin from "./components/ClassRoomLogin/ClassRoomLogin";
  import { IsUserRedirect, ProtectedRoute } from "./routes/Routes";
  import { useLocalContext } from "./context/context";
  import { useState, useEffect } from "react";
  import db from "./components/lib/Firebase";
  import JoinedClasses from "./components/JoindedClasses/JoinedClasses";
  import Main from "./components/Main/Main";
  import AddSubject from "./components/Attendance/AddSubject";
  import ExamList from "./components/Exam/ExamList";
  import StorePage from "./components/Store/StorePage";
  import { BASE_URL } from "./utils/url";
  import axios from "axios";
  import SubmittedAssignments from "./components/SubmittedAssignments/SubmittedAssignments";
  import DisplayAssignments from "./components/DueDate/DisplayAssignments";

  function App() {
    const token = getUserFromStorage();
    const user = useSelector((state) => state?.auth?.user);
    const { loggedInMail } = useLocalContext();
    console.log(token);
    const [createdClasses, setCreatedClasses] = useState([]);
    const [joinedClasses, setJoinedClasses] = useState([]);
    // const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
      if (loggedInMail) {
        let unsubscribe = db
          .collection("CreatedClasses")
          .doc(loggedInMail)
          .collection("classes")
          .onSnapshot((snapshot) => {
            setCreatedClasses(snapshot.docs.map((doc) => doc.data()));
          });
        return () => unsubscribe();
      }
    }, [loggedInMail]);

    console.log(createdClasses);

    useEffect(() => {
      if (loggedInMail) {
        let unsubcribe = db
          .collection("JoinedClasses")
          .doc(loggedInMail)
          .collection("classes")
          .onSnapshot((snapshot) => {
            setJoinedClasses(snapshot.docs.map((doc) => doc.data()));
          });
        return () => unsubcribe();
      }
    }, [loggedInMail]);
    console.log(joinedClasses);

    return (
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <PublicNavbar />
                <HeroSection />
              </>
            }
          />
          <Route
            path="/register"
            element={
              <>
                <PublicNavbar />
                <RegistrationForm />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <PublicNavbar />
                <LoginForm />
              </>
            }
          />
          {/* Authenticated Routes */}
          <Route
            path="/add-task"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <AddTask />
                </>
              </AuthRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <TasksList />
                </>
              </AuthRoute>
            }
          />
          <Route
            path="/store"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <StorePage />
                </>
              </AuthRoute>
            }
          />

          <Route
            path="/update-task/:id"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <UpdateTask />
                </>
              </AuthRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <UserProfile />
                </>
              </AuthRoute>
            }
          />

          {/* Dashboard Route Without Private Navbar */}
          <Route
            path="/classroomlogin"
            element={
              <IsUserRedirect user={loggedInMail} loggedInPath="/assignment">
                <ClassRoomLogin />
              </IsUserRedirect>
            }
          />
          <Route
            path="/assignment"
            element={
              <ProtectedRoute user={loggedInMail}>
                <PrivateNavbar />
                <AssignmentHeader />
                <ol className="joined">
                  {createdClasses.map((item) => (
                    <JoinedClasses classData={item} />
                  ))}
                  {joinedClasses.map((item) => (
                    <JoinedClasses classData={item} />
                  ))}
                </ol>
              </ProtectedRoute>
            }
          />

          {/* Dashboard Route Without Private Navbar */}
          <Route
            path="/dashboard"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />

          <Route
            path="/add-subject"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <AddSubject />
                </>
              </AuthRoute>
            }
          />
          <Route
            path="/add-subject/:id"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <AddSubject />
                </>
              </AuthRoute>
            }
          />
          <Route
            path="/exam-dashboard"
            element={
              <AuthRoute>
                <ExamList />
              </AuthRoute>
            }
          />
          {/* <Route
            path="/timetable"
            element={
            <AuthRoute>
              <Timetable/>
            </AuthRoute>
            }
          /> */}

          <Route
            path="/tasks"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <TasksList />
                </>
              </AuthRoute>
            }
          />
          <Route
            path="/update-task/:id"
            element={
              <AuthRoute>
                <>
                  <PrivateNavbar />
                  <UpdateTask />
                </>
              </AuthRoute>
            }
          />

          {/* Dynamic Routes for Created Classes */}
          {createdClasses.map((item, index) => (
            <Route
              key={index}
              path={`/${item.id}`}
              element={
                <ProtectedRoute user={loggedInMail}>
                  <PrivateNavbar />
                  <Main classData={item} />
                </ProtectedRoute>
              }
            />
          ))}

          {/* Dynamic Routes for Joined Classes */}
          {joinedClasses.map((item, index) => (
            <Route
              key={index}
              path={`/${item.id}`}
              element={
                <ProtectedRoute user={loggedInMail}>
                  <PrivateNavbar />
                  <Main classData={item} />
                </ProtectedRoute>
              }
            />
          ))}

          <Route
            path="/submissions/:classId/:postId"
            element={
              <ProtectedRoute user={loggedInMail}>
                <SubmittedAssignments />
              </ProtectedRoute>
            }
          />

          {/* {createdClasses.map((item, index) => (
            <Route
              key={index}
              path="/upcoming"
              element={
                <ProtectedRoute user={loggedInMail}>
                  
                  <DisplayAssignments classData={item} />
                </ProtectedRoute>
              }
            />
          ))} */}

          {/* only for the users due dates of the assignments are displayed(i.e joined users) */}
          {joinedClasses.map((item, index) => (
            <Route
              key={index}
              path="/upcoming"
              element={
                <ProtectedRoute user={loggedInMail}>
                  
                  <DisplayAssignments classData={item}/>
                </ProtectedRoute>
              }
            />
          ))}
          
        </Routes>
      </BrowserRouter>
    );
  }

  export default App;
