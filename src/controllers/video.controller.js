import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // Build match conditions - simple and clean
    const matchConditions = { isPublished: true }; // Only show published videos to everyone

    // Add search query if provided (for search functionality)
    if (query) {
        matchConditions.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // Add userId filter ONLY if someone specifically wants to see a user's channel
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
        matchConditions.owner = new mongoose.Types.ObjectId(userId);
    }

    // Build sort object - default random-ish (by creation time)
    const sortObject = {};
    if (sortBy) {
        sortObject[sortBy] = sortType === "asc" ? 1 : -1;
    } else {
        // For home page - mix it up! Not just newest first
        sortObject.createdAt = -1; // For now, but we can randomize later
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get videos with owner details
    const videos = await Video.aggregate([
        {
            $match: matchConditions
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                ownerDetails: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $sort: sortObject
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        },
        {
            $project: {
                title: 1,
                description: 1,
                "thumbnail.url": 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                ownerDetails: 1
            }
        }
    ]);

    // Get total count
    const totalVideos = await Video.countDocuments(matchConditions);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                videos,
                totalVideos,
                totalPages: Math.ceil(totalVideos / parseInt(limit)),
                currentPage: parseInt(page)
            },
            "Videos fetched successfully"
        ));
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    // Validation
    if (!title || title.trim() === "") {
        throw new ApiError(400, "Title is required")
    }

    if (!description || description.trim() === "") {
        throw new ApiError(400, "Description is required")
    }

    // Check for video file (from multer middleware)
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    // Check for thumbnail (from multer middleware)
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    // Upload to Cloudinary - THIS IS WHERE YOU UPLOAD TO CLOUDINARY
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Video upload to Cloudinary failed")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail upload to Cloudinary failed")
    }

    // Create video document in database
    const video = await Video.create({
        title: title.trim(),
        description: description.trim(),
        duration: videoFile.duration, // Cloudinary provides this
        videoFile: {
            url: videoFile.url,
            public_id: videoFile.public_id
        },
        thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        },
        owner: req.user._id,
        isPublished: false // Draft by default
    })

    const createdVideo = await Video.findById(video._id).populate("owner", "username avatar fullName")

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}