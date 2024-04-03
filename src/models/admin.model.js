import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength:100,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      maxlength:[50, "Max length is 50"],
      minlength:[8, "Min length is 8"],
    },
    avatar:{
       type: String //cloudnary
    },
    refreshToken: {
      type: String,
    },
   },
  {
    timestamps: true,
  }
);

export const Admin = mongoose.model("Admin", adminSchema);
