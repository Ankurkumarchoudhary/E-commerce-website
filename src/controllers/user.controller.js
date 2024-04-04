import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if ([fullName, email, password].some((field) => field?.trim() === "")) {
      const error = new ApiError(409, "All fields are required");
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

    const existUser = await User.findOne({
      email,
    });

    if (existUser) {
      const error = new ApiError(209, "User with email already exist");
      return res
        .status(209)
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
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken -accessToken "
    );

    if (!createdUser) {
      const error = new ApiError(
        409,
        " something went wrong while registering"
      );

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
      .status(200)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    error = new ApiError(400, error?.message);
    return res
      .status(400)
      .json(new ApiResponse(error.statusCode, error.data, error?.message));
  }
});

const loginUser = asyncHandler(async (req, res) => {
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

    const user = await User.findOne({ email });

    if (!user) {
      const error = new ApiError(400, "User does not exist");
      return res
        .status(400)
        .json(
          new ApiResponse(error.statusCode, error.data, "User does not exist")
        );
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

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
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
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
            user: loggedInUser,
          },
          "User logged in successfully"
        )
      );
  } catch (error) {
    error = new ApiError(400, error?.message);
    return res
      .status(400)
      .json(new ApiResponse(error.statusCode, error.data, error?.message));
  }
});

export { registerUser, loginUser };
