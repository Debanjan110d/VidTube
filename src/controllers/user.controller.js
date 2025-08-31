import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { upload_cloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js"
import { connection } from "mongoose";


const generateAccessToken_And_RefreshToken = async (userId) => {
    const user = await User.findById(userId).exec();
    try {
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong when generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    //TODO

    const { fullname, email, username, password } = req.body

    //validation - check if required fields are not empty
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existeduser = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (existeduser) {
        throw new ApiError(400, "User already exists")
    }

    const avatar_local_path = req.files?.avatar?.[0]?.path
    const cover_local_path = req.files?.coverImage[0]?.path

    if (!avatar_local_path) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await upload_cloudinary(avatar_local_path)
    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary")
    }

    let coverImage = null;
    if (cover_local_path) {
        coverImage = await upload_cloudinary(cover_local_path)
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
        // watchHistory: []
    })
    const created_user = await User.findById(user._id).select("-password -refreshToken ")
    if (!created_user) {
        throw new Error("Something went wrong, Created user not found in database", "500");
    }
    res
        .status(201)
        .json(new ApiResponse(201, "User created successfully", created_user))

})

const loginUser = asyncHandler(async (req, res) => {
    //TODO
    const { username, email, password } = req.body
    //Validation
    if (!username?.trim() && !email?.trim()) {
        throw new ApiError(400, "Either email or username is required")
    }

    const user = await User.findOne({
        $or: [
            { username: username?.toLowerCase() },
            { email: email?.toLowerCase() }
        ]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    //validation of password
    const isValidPassword = await user.isValidPassword(password)
    if (!isValidPassword) {
        throw new ApiError(401, "Invalid password")
    }

    const { accessToken, refreshToken } = await generateAccessToken_And_RefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    if (!loggedInUser) {
        throw new Error("Something went wrong, Logged in user not found in database", "500");
    }
    res.status(200).json(new ApiResponse(200, "Login successful", { accessToken, refreshToken }))

    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "production",// If this is production then secure should be true other than that false
        sameSite: "none"
    }
    res.cookie("refreshToken", refreshToken, options)



    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, "Login successful", { loggedInUser, accessToken, refreshToken }))
}
)



export {
    registerUser,
    loginUser
}
