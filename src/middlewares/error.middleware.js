import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error instanceof mongoose.Error ? 500 : 400;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, [], err.stack);
    }
    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors || [],
        stack: error.stack,
    });
};

export { errorHandler };