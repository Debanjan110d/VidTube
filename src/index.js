import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './db/index.js'

dotenv.config({
    path: 'src/.env'
})

// Environment variable validation
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI environment variable is required!");
    process.exit(1);
}

console.log("Environment variables loaded:");
console.log("PORT:", process.env.PORT || "8000");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ LOADED" : "❌ NOT LOADED");
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN || "http://localhost:3000");

/* This line of code is setting the value of the `PORT` constant. It is using the logical OR (`||`)
operator to check if the `process.env.PORT` variable has a value. If `process.env.PORT` has a value
(is truthy), then `PORT` will be set to that value. If `process.env.PORT` does not have a value (is
falsy), then `PORT` will default to 5000. This allows the server to run on the port specified in the
environment variable `PORT`, or default to port 5000 if no specific port is provided. */
const PORT = process.env.PORT || 5000 // 5000 is the default port



connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch(err => console.log("MongoDB connection error :    ", err))



