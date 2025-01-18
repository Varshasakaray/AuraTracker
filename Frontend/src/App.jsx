import { BrowserRouter,Route,Routes } from "react-router-dom";
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

function App() {
  const token = getUserFromStorage();
  const user=useSelector((state)=>state?.auth?.user);
  console.log(token);
  return (
    <BrowserRouter>
    {/*Navbar*/}
    {user ?< PrivateNavbar/>:<PublicNavbar/>}
    
    
    <Routes>
      <Route path="/" element={<HeroSection/>}/>
      <Route path="/register" element={<RegistrationForm/>}/>
      <Route path="/login" element={<LoginForm/>}/>
      <Route path="/add-task" element={
        <AuthRoute>
          <AddTask/>
        </AuthRoute>
      }/>
      <Route path="/tasks" element={
        <AuthRoute>
          <TasksList/>
        </AuthRoute>
      }/>
      <Route path="/update-task/:id" element={
        <AuthRoute>
          <UpdateTask/>
        </AuthRoute>
      }/>
      <Route path="/profile" element={
        <AuthRoute>
          <UserProfile/>
        </AuthRoute>
      }/>
      <Route path="/dashboard" element={
        <AuthRoute>
          <Dashboard/>
        </AuthRoute>
      }/>
      <Route path="/examdashboard" element={
        <AuthRoute>
          <ExamDashboard/>
        </AuthRoute>
      }/>
      <Route path="/timetable" element={
        <AuthRoute>
          <TimeTable/>
        </AuthRoute>
      }/>

    </Routes>
    </BrowserRouter>
  )
}

export default App
