import User from "../models/User.js";

const auraController = async (userId, points) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.auraPoints += points;
      await user.save();
      console.log(`Added ${points} Aura Points to user: ${user.name}`);
    }
  } catch (error) {
    console.error("Error updating Aura Points:", error);
  }
};

export default auraController;
