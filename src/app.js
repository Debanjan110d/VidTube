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
        origin: process.env.CORS_ORIGIN,

        // Allow cookies and authorization headers to be sent with cross-origin requests
        // Essential for authentication - enables frontend to send auth tokens/cookies
        // Note: When credentials=true, origin cannot be wildcard (*), must be specific domain
        credentials: true
    })
)


export { app }