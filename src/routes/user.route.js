import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentUserPassword,
    getCurrentUser,
    updateAccountdetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRoute = Router();

//unsecured routes or public routes without verifyJWT
userRoute.route("/register").post(
    upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
    registerUser
);


userRoute.route("/login").post(loginUser);
userRoute.route("/refresh-token").post(refreshAccessToken);


//secured routes

userRoute.route("/logout").post(verifyJWT, logoutUser);
userRoute.route("/change-password").post(verifyJWT, changeCurrentUserPassword);
userRoute, route("/current-user").get(verifyJWT, getCurrentUser);
userRoute.route("/c/:username").get(verifyJWT, getUserChannelProfile);// we have to do this because we have to pass username in the url mentioned in the controller as a parameter // make sure that the username is the same as the username in the url
userRoute.route("/update-account-details").patch(verifyJWT, updateAccountdetails);// we used patch instead of put because patch is used for partial updates and put is used for full updates
userRoute.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar);
userRoute.route("/update-cover-image").post(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
userRoute.route("/history").get(verifyJWT, getWatchHistory);

export default userRoute