import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscriptions.models.js"
import { Like } from "../models/like.models.js"
import { Comment } from "../models/comment.models.js"
import { Playlist } from "../models/playlist.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get comprehensive channel statistics using aggregation
    const channelStats = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } },
                totalComments: { $sum: { $size: "$comments" } },
                totalDuration: { $sum: "$duration" },
                publishedVideos: {
                    $sum: {
                        $cond: [{ $eq: ["$isPublished", true] }, 1, 0]
                    }
                },
                draftVideos: {
                    $sum: {
                        $cond: [{ $eq: ["$isPublished", false] }, 1, 0]
                    }
                }
            }
        }
    ])

    // Get subscriber count
    const subscriberCount = await Subscription.countDocuments({
        channel: req.user._id
    })

    // Get total subscriptions (channels user follows)
    const subscriptionCount = await Subscription.countDocuments({
        subscriber: req.user._id
    })

    // Get playlist count
    const playlistCount = await Playlist.countDocuments({
        owner: req.user._id
    })

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentStats = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(req.user._id),
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: null,
                recentVideos: { $sum: 1 },
                recentViews: { $sum: "$views" }
            }
        }
    ])

    // Get top performing video
    const topVideo = await Video.findOne({
        owner: req.user._id,
        isPublished: true
    }).sort({ views: -1 }).select("title views thumbnail")

    const stats = {
        overview: {
            totalVideos: channelStats[0]?.totalVideos || 0,
            publishedVideos: channelStats[0]?.publishedVideos || 0,
            draftVideos: channelStats[0]?.draftVideos || 0,
            totalViews: channelStats[0]?.totalViews || 0,
            totalLikes: channelStats[0]?.totalLikes || 0,
            totalComments: channelStats[0]?.totalComments || 0,
            totalDuration: channelStats[0]?.totalDuration || 0,
            subscriberCount,
            subscriptionCount,
            playlistCount
        },
        recentActivity: {
            videosLast30Days: recentStats[0]?.recentVideos || 0,
            viewsLast30Days: recentStats[0]?.recentViews || 0
        },
        topPerforming: {
            topVideo: topVideo || null
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc",
        status = "all" // all, published, draft
    } = req.query

    // Build match conditions
    const matchConditions = {
        owner: mongoose.Types.ObjectId(req.user._id)
    }

    // Filter by publish status
    if (status === "published") {
        matchConditions.isPublished = true
    } else if (status === "draft") {
        matchConditions.isPublished = false
    }

    // Build sort object
    const sortObject = {}
    sortObject[sortBy] = sortType === "asc" ? 1 : -1

    // Get videos with detailed analytics
    const videosAggregate = Video.aggregate([
        {
            $match: matchConditions
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
                engagement: {
                    $add: [
                        { $size: "$likes" },
                        { $size: "$comments" }
                    ]
                }
            }
        },
        {
            $sort: sortObject
        },
        {
            $project: {
                title: 1,
                description: 1,
                "thumbnail.url": 1,
                "videoFile.url": 1,
                duration: 1,
                views: 1,
                likesCount: 1,
                commentsCount: 1,
                engagement: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const videos = await Video.aggregatePaginate(videosAggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}