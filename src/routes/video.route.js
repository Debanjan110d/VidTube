import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const videoRouter = Router();

// Public routes
videoRouter.route("/").get(getAllVideos);
videoRouter.route("/:videoId").get(getVideoById);

// Protected routes
videoRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes after this line

videoRouter.route("/").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo
);

videoRouter
    .route("/:videoId")
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(deleteVideo);

videoRouter.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default videoRouter;