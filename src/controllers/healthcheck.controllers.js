import ApiResponse from "../utils/apiResponse.js";
import AsyncHandler from "../utils/asyncHandler.js";


const healthcheck = AsyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(ApiResponse.success("Server is up and running"))
})