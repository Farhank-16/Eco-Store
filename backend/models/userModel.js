import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,

      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: true,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
        "Password must contain uppercase, lowercase, number and special character",
      ],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    image: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
