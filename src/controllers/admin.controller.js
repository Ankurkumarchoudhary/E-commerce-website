import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    const error= new ApiError(400, "All fields are required");
   return res
    .status(409)
    .json(
      new ApiResponse(
        error.statusCode,
        error.data,
        "All fields are required"
      )
    );
    
  }

  const existAdmin = await Admin.findOne({
    email,
  });

  if (existAdmin) {
    const error = new ApiError(409, "Admin with email already exist");
    return res
      .status(409)
      .json(
        new ApiResponse(
          error.statusCode,
          error.data,
          "Admin with email or already exist"
        )
      );
  }

  const admin = await Admin.create({
    fullName,
    email,
    password,
  });
  const createdAdmin = await Admin.findById(admin._id).select("-password ");

  if (!createdAdmin) {
    const error= new ApiError(500, " something went wrong while registering");

     return res
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
    .json(new ApiResponse(200, createdAdmin, "Admin registered successfully"));
});

export { registerAdmin };
