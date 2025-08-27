class ApiError extends Error {// Error Is a Build in Js Class
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        // Call parent constructor to initialize Error properties
        // This is necessary because we are extending the Error class 
        //Since we are using extends Error Class we have to use super because it is a constructor
        super();
        this.statusCode = statusCode;
        this.data = null
        this.message = message;
        this.sucess = false
        this.errors = errors


        if (stack) {
            this.stack = stack

        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }