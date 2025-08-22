import mongoose, { Schema } from "mongoose";
import { Video } from "./video.models";

const commentSchema = new Schema({
    conntent: {
        type: String,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        // required : true
    }

},
    {
        timestamps: true
    })


export const Comment = mongoose.model("Comment", commentSchema)