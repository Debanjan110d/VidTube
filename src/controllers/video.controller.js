import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { upload_cloudinary, delete_from_cloudinary } from "../utils/cloudinary.js"

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
        matchConditions.owner = mongoose.Types.ObjectId(userId);
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
                            "avatar.url": 1
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
    const videoFile = await upload_cloudinary(videoFileLocalPath)
    const thumbnail = await upload_cloudinary(thumbnailLocalPath)

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

    const createdVideo = await Video.findById(video._id).populate("owner", "username avatar")

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Aggregate video with owner details and increment views
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
                isPublished: true
            }
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
                            "avatar.url": 1
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
        }
    ])

    if (!video?.length) {
        throw new ApiError(404, "Video not found")
    }

    // Increment views
    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    })

    // Add to user's watch history if logged in
    if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: {
                watchHistory: videoId
            }
        })
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "Video details fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find video and check ownership
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos")
    }

    // Prepare update object
    const updateFields = {}

    if (title && title.trim() !== "") {
        updateFields.title = title.trim()
    }

    if (description && description.trim() !== "") {
        updateFields.description = description.trim()
    }

    // Handle thumbnail update if provided
    if (req.file) {
        const thumbnailLocalPath = req.file.path
        const thumbnail = await upload_cloudinary(thumbnailLocalPath)

        if (!thumbnail) {
            throw new ApiError(400, "Thumbnail upload failed")
        }

        // Delete old thumbnail from cloudinary
        if (video.thumbnail?.public_id) {
            await delete_from_cloudinary(video.thumbnail.public_id)
        }

        updateFields.thumbnail = {
            url: thumbnail.url,
            public_id: thumbnail.public_id
        }
    }

    // Update video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    ).populate("owner", "username avatar")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find video and check ownership
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos")
    }

    // Delete video file from cloudinary
    if (video.videoFile?.public_id) {
        await delete_from_cloudinary(video.videoFile.public_id)
    }

    // Delete thumbnail from cloudinary
    if (video.thumbnail?.public_id) {
        await delete_from_cloudinary(video.thumbnail.public_id)
    }

    // Delete video from database
    await Video.findByIdAndDelete(videoId)

    // Remove from all users' watch history
    await User.updateMany(
        { watchHistory: videoId },
        { $pull: { watchHistory: videoId } }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Find video and check ownership
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only modify your own videos")
    }

    // Toggle publish status
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: !video.isPublished } },
        { new: true }
    ).populate("owner", "username avatar")

    const message = updatedVideo.isPublished ? "Video published successfully" : "Video unpublished successfully"

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, message))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}