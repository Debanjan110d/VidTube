import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { upload_cloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js"
import { connection } from "mongoose";
import jwt from "jsonwebtoken";


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

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        //Need to come back here after middleware video 
        await User.findByIdAndUpdate(
            req.user._id,
            {
                set: {
                    refreshToken: null
                }
            },
            { new: true }

        )
    )
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    }


    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Logout successful"))// { } means there is no data with us as its a empty object
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


const refreshAccessToken = asyncHandler(async (req, res) => {
    //TODO
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.headers["x-refresh-token"]
    if (!incomingRefreshToken) {
        throw new Error("Refresh token is required", "401");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)// ? this is optional chaining
        if (!user) {
            throw new Error("Invalid refresh token", "402");

        }
        if (user?.refreshToken !== incomingRefreshToken) {
            throw new Error("Refresh token is expired", "403");
        }

        const options = {
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            secure: process.env.NODE_ENV === "production",// If this is production then secure should be true other than that false
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessToken_And_RefreshToken(user._id)
        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    200, "Login successful",
                    { accessToken, refreshToken: newRefreshToken }
                )
            )

    } catch (error) {
        throw new ApiError(401, "Something went wrong while refreshing the access token");

    }
})

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isValidPassword = await user.isValidPassword(oldPassword)

    if (!isValidPassword) {
        throw new ApiError(401, "Incorrect current password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {

    res.status(200).json(new ApiResponse(200, "User found successfully", req.user, "Current User Details Fetched Successfully"))
})

const updateAccountdetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(" 400", "Fullname and email are required");
    }
    User.findByIdAndUpdate(req.user?._id,
        {
            $set: {// $set → MongoDB operator to update specific fields without replacing the whole document.
                fullname,
                email
            }

        },
        { new: true }
    ).select("-password -refreshToken")//So, "-password -refreshToken" means: "Get me the document(s), but make sure to remove the password field and the refreshToken field before you send them back."

    res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatar_local_path = req.file?.path
    if (!avatar_local_path) {
        throw new ApiError(400, "Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatar_local_path)
    if (!avatar.url) {
        throw new ApiError(400, "Avatar upload failed");
    }
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {// set is a command to update specific fields without replacing the whole document in mongodb
                avatar: avatar.url
            }
        }, { new: true }).select("-password -refreshToken")

    res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImage_local_path = req.file?.path
    if (!coverImage_local_path) {
        throw new ApiError(400, "Cover image is required")
    }
    const coverImage = await uploadOnCloudinary(coverImage_local_path)
    if (!coverImage.url) {
        throw new ApiError(400, "Cover image upload failed");
    }
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {// set is a command to update specific fields without replacing the whole document in mongodb
                coverImage: coverImage.url
            }
        }, { new: true }).select("-password -refreshToken")

    res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"))


})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params// params is an object that contains the route parameters passed in the URL.


    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase() // Convert username to lowercase for case-insensitive search
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"

                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscriberedTo"


                }
            },
            {
                $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    channelSubscribersCount: { $size: "$subscriberedTo" }
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },// $in[req.user?._id] checks if req.user?._id is present in the subscriberedTo array.
                    },
                    then: true,
                    else: false
                }


            }
        ]
    )

})

const getWatchHistory = asyncHandler(async (req, res) => {

})

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountdetails,
    updateUserAvatar,
    updateUserCoverImage
}
