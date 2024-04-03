import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password} = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    const error= new ApiError(400, "All fields are required");
    res
    .status(409)
    .json(
      new ApiResponse(
        error.statusCode,
        error.data,
        "All fields are required"
      )
    );
    
  }

  const existUser = await User.findOne({
    email,
  });

  if (existUser) {
    const error = new ApiError(409, "User with email already exist");
    res
      .status(409)
      .json(
        new ApiResponse(
          error.statusCode,
          error.data,
          "User with email or already exist"
        )
      );
  }

  const user = await User.create({
    fullName,
    email,
    password,
  });
  const createdUser = await User.findById(user._id).select("-password ");

  if (!createdUser) {
    const error= new ApiError(500, " something went wrong while registering");

    res
      .status(409)
      .json(
        new ApiResponse(
          error.statusCode,
          error.data,
          "something went wrong while registering"
        )
      );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
