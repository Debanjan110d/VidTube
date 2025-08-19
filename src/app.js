import express from "express";
import cors from "cors"


const app = express()

// CORS (Cross-Origin Resource Sharing) Middleware Configuration
// This middleware controls which websites can make requests to our server from different domains
app.use(
    cors({
        // Allow requests only from the domain specified in CORS_ORIGIN environment variable
        // This prevents unauthorized websites from accessing our API
        // Example: CORS_ORIGIN=http://localhost:3000 for development
        origin: process.env.CORS_ORIGIN,//This is one isjust a variable thats value is set in the .env file

        // Allow cookies and authorization headers to be sent with cross-origin requests
        // Essential for authentication - enables frontend to send auth tokens/cookies
        // Note: When credentials=true, origin cannot be wildcard (*), must be specific domain
        credentials: true
    })
)

//common Middlewares

//We will also add some express middlewares to make it more secure 
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))//Extended: true means the latest version of express will be used to encode the url like the the spaces will be encoded as %20 instead of +

//We will be serving some static files
app.use(express.static('public'))


//import routes

import healthcheckRoute from "./routes/healthcheck.route.js"
app.use("/healthcheck", healthcheckRoute)


//routes 

app.use("/api/v1/healthcheck", healthcheckRoute)


export { app }



