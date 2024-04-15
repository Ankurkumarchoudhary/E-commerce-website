import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const admin = await Admin.findById(userId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
const registerAdmin = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if ([firstName, lastName, email, password].some((field) => field?.trim() === "")) {
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
    firstName,
    lastName,
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

const loginAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      const error = new ApiError(400, "email is requried");
      return res
        .status(400)
        .json(
          new ApiResponse(error.statusCode, error.data, "email is requried")
        );
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      const error = new ApiError(400, "Admin does not exist");
      return res
        .status(400)
        .json(
          new ApiResponse(error.statusCode, error.data, "Admin does not exist")
        );
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);

    if (!isPasswordValid) {
      const error = new ApiError(401, "Invalid user credentials");
      return res
        .status(401)
        .json(
          new ApiResponse(
            error.statusCode,
            error.data,
            "Invalid user credentials"
          )
        );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      admin._id
    );

    const loggedInAdmin = await Admin.findById(admin._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            admin: loggedInAdmin,
            accessToken,
            refreshToken,
          },
          "Admin logged in successfully"
        )
      );
  } catch (error) {
    error = new ApiError(400, error?.message);
    return res
      .status(400)
      .json(new ApiResponse(error.statusCode, error.data, error?.message));
  }
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out"));
});

const getAllAdmin = asyncHandler(async(req, res) =>{
  try {
    const admins = await Admin.find();
    return res
    .status(200)
    .json( new ApiResponse ( 200,admins, "found all admins" ));
} catch (error) {
  
  error = new ApiError(400, error?.message);
  return res
    .status(400)
    .json(new ApiResponse(error.statusCode, error.data, error?.message));
}
})

export { registerAdmin, loginAdmin, logoutAdmin, getAllAdmin };

