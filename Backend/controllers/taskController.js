import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";


const taskController = {
  //!add
  create: asyncHandler(async (req, res) => {
    const { name, type } = req.body;
    if (!name || !type) {
      throw new Error("Name and type are required for creating a Task");
    }
    //Convert the name to lowercase
    const normalizedName = name.toLowerCase();
    //! Check if the type is valid
    const validTypes = ["income", "expense"];
    if (!validTypes.includes(type.toLowerCase())) {
      throw new Error("Invalid Task type" + type);
    }
    //!Check if Task already exists on the user
    const TaskExists = await Task.findOne({
      name: normalizedName,
      user: req.user,
    });
    if (TaskExists) {
      throw new Error(
        `Task ${TaskExists.name} already exists in the database`
      );
    }
    //! Create the Task
    const newTask = await Task.create({
      name: normalizedName,
      user: req.user,
      type,
    });
    res.status(201).json(newTask);
  }),

  //!lists
  lists: asyncHandler(async (req, res) => {
    const tasks = await Task.find({ user: req.user });
    res.status(200).json(tasks);
  }),

  //!update
  update: asyncHandler(async (req, res) => {
    const { TaskId } = req.params;
    const { type, name } = req.body;
    const normalizedName = name.toLowerCase();
    const taskToUpdate = await Task.findById(TaskId);
    if (!taskToUpdate && taskToUpdate.user.toString() !== req.user.toString()) {
      throw new Error("Task not found or user not authorized");
    }
    const oldName = taskToUpdate.name;
    //! Update Task properties
    taskToUpdate.name = normalizedName || taskToUpdate.name;
    taskToUpdate.type = type || taskToUpdate.type;
    const updatedTask = await taskToUpdate.save();
    // //Update affected transaction
    // if (oldName !== updatedTask.name) {
    //   await Transaction.updateMany(
    //     {
    //       user: req.user,
    //       Task: oldName,
    //     },
    //     { $set: { Task: updatedTask.name } }
    //   );
    // }
    res.json(updatedTask);
  }),
  //! delete
  delete: asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);
    console.log(req.user);  // Log to ensure req.user is populated correctly

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "User not authorized to delete this task" });
    }

    try {
      // // If needed, update transactions before deletion
      // await Transaction.updateMany(
      //   { user: req.user, Task: task.name },
      //   { $set: { Task: "Uncategorized" } }
      // );

      // Delete the task
      await Task.findByIdAndDelete(req.params.id);
      res.json({ message: "Task removed and transactions updated" });
    } catch (error) {
      console.error(error);  // Log the error for debugging
      res.status(500).json({ message: "An error occurred while deleting the task" });
    }
  }),
};

export default taskController;