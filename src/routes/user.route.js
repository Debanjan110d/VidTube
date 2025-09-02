import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRoute = Router();


userRoute.route("/register").post(
    upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
    registerUser
);

//secured routes
userRoute.route("/login").post(loginUser);
userRoute.route("/logout").post(verifyJWT, logoutUser);

export default userRoute