import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
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
  //   isAdmin: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   isClient:{
  //     type: Boolean,
  //     default: false,
  //   }
   },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
