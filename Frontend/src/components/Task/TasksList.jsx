import React, { useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { deleteTaskAPI, listTasksAPI, updateTaskAPI, AddTaskAPI } from "../../services/task/taskService";
import AlertMessage from "../Alert/AlertMessage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; 
import { Switch } from "@headlessui/react";
import { toast } from "react-toastify";
import badgeImage from "../../assets/newBie.jpg";
import striver from "../../assets/striver.jpg";
import risingStar from "../../assets/risingStar.jpg";
import paceseter from "../../assets/paceseter.jpg";
import legend from "../../assets/legend.jpg";
import trailBlind from "../../assets/trailBlind.jpg";
import trailBlozer from "../../assets/trailBlozer.jpg";
import masterMind from "../../assets/masterMind.jpg";
import axios from "axios";
import { BASE_URL } from "../../utils/url";

const TasksList = () => {
  const [newTaskName, setNewTaskName] = useState("");

  const updateAuraPointsAndBadge = async () => {
    const badgeThresholds = [
      { points: 50, name: "Newbie", image: badgeImage },
      { points: 100, name: "Striver", image: striver },
      { points: 150, name: "Achiever", image: risingStar },
      { points: 200, name: "Expert", image: paceseter },
      { points: 500, name: "Master", image: legend },
      { points: 1000, name: "Trailblazer", image: trailBlind },
      { points: 2000, name: "Pioneer", image: trailBlozer },
      { points: 5000, name: "Mastermind", image: masterMind },
    ];

    const token = localStorage.getItem("token");
    try {
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      // // 1. Get updated Aura points
      // await axios.post(
      //   `${BASE_URL}/users/update-points`,
      //   {
      //     pointsToAdd: 10,
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      toast.success("🎉 Task marked as Complete! 🪙 +10 Aura points");

      // Save notification to DB
      await axios.post(
        `${BASE_URL}/notifications`,
        { message: "🎉 Task marked as Complete! 🪙 +10 Aura points" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Get updated user profile
      const { data: userData } = await axios.get(`${BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const points = userData.auraPoints || 0;
      const serverBadges = userData.badges || [];

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("userInfo")) || {};
      storedUser.auraPoints = points;
      storedUser.badges = serverBadges;
      localStorage.setItem("userInfo", JSON.stringify(storedUser));

      // 3. Get updated Badge
      const earnedBadge = badgeThresholds
        .slice()
        .reverse()
        .find(
          (badge) =>
            points >= badge.points && !serverBadges.includes(badge.name)
        );

      if (earnedBadge) {
        const updatedBadges = [...new Set([...serverBadges, earnedBadge.name])];

        // Save to MongoDB
        await axios.put(
          `${BASE_URL}/users/update-badges`,
          { badges: updatedBadges },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );



        // Save notification to DB
        await axios.post(
          `${BASE_URL}/notifications`,
          { message: `🎉 You earned a new badge: ${earnedBadge.name}!` },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`🏅 You just unlocked a badge: ${earnedBadge.name}`);
      }
    } catch (err) {
      console.error("Aura update or badge check failed:", err);
    }
  };

  const { data, isError, isLoading, error, refetch } = useQuery({
    queryFn: listTasksAPI,
    queryKey: ["list-tasks"],
  });


  // Navigate
  const navigate = useNavigate();

  // Mutations
  const { mutateAsync: deleteTask } = useMutation({mutationFn:deleteTaskAPI});
  const { mutateAsync: updateTask } = useMutation({ mutationFn: updateTaskAPI });
  const { mutateAsync: addTask, isPending: isAdding } = useMutation({ mutationFn: AddTaskAPI });

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    try {
      await addTask({ name: newTaskName, type: "incomplete" });
      setNewTaskName("");
      toast.success("Task added successfully!");
      refetch();
    } catch (err) {
      console.error("Error adding task:", err);
      toast.error("Failed to add task.");
    }
  };


  // Delete handler
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      refetch();
    } catch (e) {
      console.log("Error deleting task:", e);
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (task) => {
    try {
      const newType = task.type === "complete" ? "complete" : "complete";
      const { updatedTask, updatedUser } = await updateTask({
        name: task.name,
        type: newType,
        id: task._id,
      });
  
      // Update localStorage with the new user data
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo) {
        userInfo.auraPoints = updatedUser.auraPoints;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      }
  
      
      updateAuraPointsAndBadge();
      refetch(); // Refresh task list
    } catch (e) {
      console.log("Error updating task:", e);
    }
  };
  
  // Sort tasks: incomplete first, then completed tasks
  const sortedTasks = Array.isArray(data)
    ? [
        ...data.filter((task) => task.type !== "complete"),
        ...data.filter((task) => task.type === "complete"),
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl text-center font-extrabold text-gray-800">
        Your Tasks
      </h2>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-8 relative flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-4 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isAdding}
          />
        </div>
        <button
          type="submit"
          disabled={!newTaskName.trim() || isAdding}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2"
        >
          {isAdding ? "Adding..." : <><FaPlus className="text-sm" /> Add</>}
        </button>
      </form>

      {/* Display alert message */}
      {isLoading && (
        <div className="mb-6"><AlertMessage type="loading" message={"Loading Tasks..."} /></div>
      )}
      {isError && (
        <div className="mb-6"><AlertMessage
          type="error"
          message={
            error?.response?.data?.message ||
            "Something happened, please try again later"
          }
        /></div>
      )}


      {/* Task List */}
      <div className="space-y-4">
        {sortedTasks.length === 0 && !isLoading && !isError ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">No tasks yet.</p>
            <p className="text-sm mt-1">Add a task above to get started!</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task?._id}
              className={`flex justify-between items-center p-4 rounded-md border ${
                task.type === "complete" 
                  ? "bg-gray-50 border-gray-200" 
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <Switch
                  checked={task.type === "complete"}
                  onChange={() => task.type !== "complete" && handleToggleComplete(task)}
                  className={`${
                    task.type === "complete" ? "bg-green-500" : "bg-gray-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                >
                  <span className="sr-only">Toggle Task Completion</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      task.type === "complete" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </Switch>
                <div className="flex flex-col">
                  <span className={`text-base font-medium ${task.type === "complete" ? "text-gray-500 line-through" : "text-gray-800"}`}>
                    {task?.name}
                  </span>
                  <span
                    className={`mt-0.5 inline-flex w-max items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      task.type === "complete"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {task?.type === "complete" ? "Completed" : "In Progress"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(task?._id)}
                className="ml-3 p-2 text-gray-500 hover:text-red-500 rounded focus:outline-none"
                title="Delete task"
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksList;
