import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: number;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
