import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter = Router();

// Public routes
commentRouter.route("/:videoId").get(getVideoComments);

// Protected routes
commentRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes after this line

commentRouter.route("/:videoId").post(addComment);
commentRouter.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default commentRouter;