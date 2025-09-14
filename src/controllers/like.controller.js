import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check if user already liked this video
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    let message

    if (existingLike) {
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id)
        message = "Video unliked successfully"
    } else {
        // Like the video
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        message = "Video liked successfully"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, message))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    // Check if comment exists
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Check if user already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    let message

    if (existingLike) {
        // Unlike the comment
        await Like.findByIdAndDelete(existingLike._id)
        message = "Comment unliked successfully"
    } else {
        // Like the comment
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        message = "Comment liked successfully"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, message))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    // Validate tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    // Check if tweet exists
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Check if user already liked this tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    let message

    if (existingLike) {
        // Unlike the tweet
        await Like.findByIdAndDelete(existingLike._id)
        message = "Tweet unliked successfully"
    } else {
        // Like the tweet
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        message = "Tweet liked successfully"
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, message))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query

    // Get liked videos using aggregation
    const likedVideosAggregate = Like.aggregate([
        {
            $match: {
                likedBy: mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
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
                ]
            }
        },
        {
            $addFields: {
                videoDetails: {
                    $first: "$videoDetails"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                videoDetails: 1,
                createdAt: 1
            }
        }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const likedVideos = await Like.aggregatePaginate(likedVideosAggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}