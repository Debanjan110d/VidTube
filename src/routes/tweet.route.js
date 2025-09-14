import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();

// Public routes
tweetRouter.route("/user/:userId").get(getUserTweets);

// Protected routes
tweetRouter.use(verifyJWT);

tweetRouter.route("/").post(createTweet);

tweetRouter
    .route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default tweetRouter;