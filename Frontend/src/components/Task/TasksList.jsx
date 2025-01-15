import React from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { deleteTaskAPI, listTasksAPI } from "../../services/task/taskService";
import AlertMessage from "../Alert/AlertMessage";

const TasksList = () => {
  const { data, isError, isLoading, error, refetch } = useQuery({
    queryFn: listTasksAPI,
    queryKey: ["list-tasks"],
  });

  // Navigate
  const navigate = useNavigate();

  // Mutation for delete
  const { mutateAsync, isPending, error: taskErr, isSuccess } = useMutation({
    mutationFn: deleteTaskAPI,
    mutationKey: ["delete-task"],
  });

  // Delete handler
  const handleDelete = async (id) => {
    try {
      // Await the delete operation
      await mutateAsync(id);
      refetch(); // Refetch tasks after successful delete
    } catch (e) {
      console.log("Error deleting task:", e);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tasks</h2>
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

      {/* Check if data exists and is an array */}
      <ul className="space-y-4">
        {Array.isArray(data) &&
          data.map((task) => (
            <li
              key={task?._id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
            >
              <div>
                <span className="text-gray-800">{task?.name}</span>
                <span
                  className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.type === "income"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {task?.type?.charAt(0).toUpperCase() + task?.type?.slice(1)}
                </span>
              </div>
              <div className="flex space-x-3">
                <Link to={`/update-task/${task._id}`}>
                  <button className="text-blue-500 hover:text-blue-700">
                    <FaEdit />
                  </button>
                </Link>
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
