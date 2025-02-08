import React from "react";
import { FaTrash } from "react-icons/fa";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { deleteTaskAPI, listTasksAPI, updateTaskAPI } from "../../services/task/taskService";
import AlertMessage from "../Alert/AlertMessage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // For styling the progress bar
import { Switch } from "@headlessui/react";

const TasksList = () => {
  const { data, isError, isLoading, error, refetch } = useQuery({
    queryFn: listTasksAPI,
    queryKey: ["list-tasks"],
  });

  // Calculate progress percentages
  const calculateTaskProgress = (tasks) => {
    if (!Array.isArray(tasks)) return { completed: 0, incomplete: 0 };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.type === "complete").length;
    const incompleteTasks = totalTasks - completedTasks;

    const completedPercentage = (completedTasks / totalTasks) * 100;
    const incompletePercentage = 100 - completedPercentage;

    return {
      completed: completedPercentage,
      incomplete: incompletePercentage
    };
  };

  const { completed, incomplete } = calculateTaskProgress(data);

  // Determine motivational message
  const getMotivationalMessage = () => {
    if (completed === 0) {
      return "Let's get started! You're capable of completing these tasks!";
    }
    if (completed <= 50) {
      return "Great progress! Keep going to complete more tasks!";
    }
    if (completed < 100) {
      return "You're almost there! Finish strong!";
    }
    return "Amazing! You've completed all your tasks!";
  };

  // Navigate
  const navigate = useNavigate();

  // Mutation for delete
  const { mutateAsync: deleteTask } = useMutation({mutationFn:deleteTaskAPI});
  const { mutateAsync: updateTask } = useMutation({ mutationFn: updateTaskAPI });

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
  
      alert(`Task marked as complete! Your new aura points: ${updatedUser.auraPoints}`);
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
    <div className="max-w-4xl mx-auto my-10 bg-white p-10 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Tasks</h2>

      {/* Display motivational message */}
      <div className="bg-blue-100 p-4 rounded-md text-center mb-6">
        <p className="text-lg font-semibold text-blue-700">{getMotivationalMessage()}</p>
      </div>

      {/* Display alert message */}
      {isLoading && (
        <AlertMessage type="loading" message={"Loading Tasks..."} />
      )}
      {isError && (
        <AlertMessage
          type="error"
          message={
            error?.response?.data?.message ||
            "Something happened, please try again later"
          }
        />
      )}

      {/* Task Progress Section */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Task Completion Progress
          </h3>
          <div className="flex space-x-16 items-center justify-center">
            {/* Completed Tasks Donut Progress */}
            <div className="w-40 h-40">
              <CircularProgressbar
                value={completed}
                text={`${Math.round(completed)}%`}
                styles={{
                  path: {
                    stroke: "#4caf50", // Green for completed tasks
                    strokeLinecap: "round",
                  },
                  trail: {
                    stroke: "#e0e0e0", // Grey background for the circle
                  },
                  text: {
                    fill: "#4caf50", // Green text for percentage
                    fontSize: "30px", // Larger text size
                  },
                }}
              />
              <span className="block text-center text-lg">Completed</span>
            </div>
            
            {/* Incomplete Tasks Donut Progress */}
            <div className="w-40 h-40">
              <CircularProgressbar
                value={incomplete}
                text={`${Math.round(incomplete)}%`}
                styles={{
                  path: {
                    stroke: "#f44336", // Red for incomplete tasks
                    strokeLinecap: "round",
                  },
                  trail: {
                    stroke: "#e0e0e0", // Grey background for the circle
                  },
                  text: {
                    fill: "#f44336", // Red text for percentage
                    fontSize: "30px", // Larger text size
                  },
                }}
              />
              <span className="block text-center text-lg">Incomplete</span>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <ul className="space-y-6">
        {sortedTasks.map((task) => (
          <li
            key={task?._id}
            className="flex justify-between items-center bg-gray-50 p-4 rounded-md"
          >
            <div>
              <span className="text-gray-800 text-xl">{task?.name}</span>
              <span
                className={`ml-2 px-3 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  task.type === "complete"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {task?.type?.charAt(0).toUpperCase() + task?.type?.slice(1)}
              </span>
            </div>
            <div className="flex space-x-4">
              {/* Show Toggle button for all tasks */}
              <Switch
                checked={task.type === "complete"}
                onChange={() => task.type !== "complete" && handleToggleComplete(task)}
                className={`${task.type === "complete" ? "bg-green-500" : "bg-gray-200"} relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Toggle Task Completion</span>
                <span
                  className={`inline-block h-4 w-4 transform ${
                    task.type === "complete" ? "translate-x-6 bg-green-600" : "translate-x-1 bg-blue-500"
                  } rounded-full transition-transform`}
                />
              </Switch>
              <button
                onClick={() => handleDelete(task?._id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TasksList;
