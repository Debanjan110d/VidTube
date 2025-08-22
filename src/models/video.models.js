import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({

    videoFile: {
        type: String,//Cloudinary url
        required: true,

    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    views: {
        type: Number,

        default: 0
    },
    duration: {
        type: Number,
        required: true,
    },
    isPublished: {
        type: Number,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }



},
    {
        timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate);//For pagination
export const Video = mongoose.model("Video", videoSchema);

