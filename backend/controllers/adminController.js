import User from "../models/userModel.js";

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Admin Dashboard Stats
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    // Add more stats here like total orders, products, etc.

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
