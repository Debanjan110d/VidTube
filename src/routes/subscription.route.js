import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

// All subscription routes require authentication
subscriptionRouter.use(verifyJWT);

subscriptionRouter.route("/c/:channelId").post(toggleSubscription);
subscriptionRouter.route("/c/:channelId").get(getUserChannelSubscribers);
subscriptionRouter.route("/u/:subscriberId").get(getSubscribedChannels);

export default subscriptionRouter;