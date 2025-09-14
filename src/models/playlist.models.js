import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Playlist schema - groups multiple videos under a single user-owned playlist
// Follows the style used in your User and Video models

const playlistSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Playlist title is required'],
            trim: true,
            index: true,
        },

        description: {
            type: String,
            default: '',
            trim: true,
        },

        owner: {
            // who created / owns the playlist
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],

        thumbnail: {
            // optional playlist thumbnail (could be a Cloudinary url)
            type: String,
        },

        privacy: {
            // allow simple privacy control
            type: String,
            enum: ['public', 'private', 'unlisted'],
            default: 'public',
        },

        views: {
            type: Number,
            default: 0,
        },

        totalDuration: {
            // total duration of all videos in seconds (optional, can be updated when videos change)
            type: Number,
            default: 0,
        },

        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],

        collaborators: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for frequently queried combos (owner + privacy)
// create a compound index on owner and privacy fields
// this index will improve performance on queries that filter playlists by owner and privacy
// e.g. finding all public playlists for a specific user
playlistSchema.index({ owner: 1, privacy: 1 });

playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model('Playlist', playlistSchema);
