import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// we can directly export this too like this : export const verifyJWT = asyncHandler(async (req, res, next) => {})
const verifyJWT = asyncHandler(async (req, _, next) => {// There is no use of response here so its good to use _ instead of res

    const token = req.cookies.accessToken || req.body.accessToken || req.header("Authorization").replace("Bearer ", "");/// DO not forget to add the space after the Bearer and also always use header not headers because teh headers comes as case sensitive

    if (!token) {
        return next(new ApiError(401, "Unauthorized"));
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        req.user = user;

        next();// to transfer the control to the next middleware


    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
})

export { verifyJWT };