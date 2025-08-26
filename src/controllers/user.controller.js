import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
    //TODO

    const { fullname, email, username, password } = req.body

    //validation - check if required fields are not empty
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existeduser = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    })
    if (existeduser) {
        throw new ApiError(400, "User already exists")
    }

    const avatar_local_path = req.files?.avatar[0]?.path
})


export {
    registerUser
}
