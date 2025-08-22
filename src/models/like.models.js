import mongoose, { Schema } from "mongoose";//Declaring Schema from mongoose so that do not have to create it again and again

const likeSchema = new Schema(// Schema is a constructor function that is used to create a new schema for the like model
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true//The documents will automatically gets the createdAt and updatedAt fields
    }
)

// Indexes to prevent duplicate likes
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true, sparse: true });
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true, sparse: true });// this is done in 2 parts because most videos sometmes have either comments or likes and sometimes both

export const Like = mongoose.model("Like", likeSchema);
