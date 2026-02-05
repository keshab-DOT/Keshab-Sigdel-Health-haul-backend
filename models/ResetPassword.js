import mongoose from "mongoose";

const ResetPasswordSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Reset Password Token is required"],
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 3600000, // 1 hour
  },
    isUsed: {
        type: Boolean,
        default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
});

const model = mongoose.model("ResetPassword", ResetPasswordSchema);

export default model