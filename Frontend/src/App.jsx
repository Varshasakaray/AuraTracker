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
import TimeTable from "./components/Users/TimeTable";
import AddSubject from "./components/Attendance/AddSubject";


function App() {
  const token = getUserFromStorage();
  const user = useSelector((state) => state?.auth?.user);
  console.log(token);

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
