import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { upload_cloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js"

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


export {
    registerUser
}
