import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles:   { type: [String], default: ["USER"] },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpiryTime: { type: Date },
  resetPasswordCode:       { type: String,  default: null },
  resetPasswordExpiryTime: { type: Date,    default: null },
  status: {
    type: String,
    enum: ["Active", "Suspended", "Banned"],
    default: "Active",
  },
  approvalStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

const User = mongoose.model("User", userSchema);
export default User;