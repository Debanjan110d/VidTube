import { v2 as cloudinary } from "cloudinary"
import { log } from "console"
import fs from "fs"//file system from node.js default
import dotenv from "dotenv"

dotenv.config({
    path: "./src/.env"
})

//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const upload_cloudinary = async (localFilePath) => {// localhere means the path of that thing in the server
    try {
        if (!localFilePath) {
            console.log("No file path provided");
            return null
        }

        console.log("Uploading file:", localFilePath);
        console.log("Cloudinary config:", {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? "***" : "NOT SET",
            api_secret: process.env.CLOUDINARY_API_SECRET ? "***" : "NOT SET"
        });

        // Normalize the file path for cross-platform compatibility
        const normalizedPath = localFilePath.replace(/\\/g, '/');
        console.log("Normalized path:", normalizedPath);

        const response = await cloudinary.uploader.upload(normalizedPath, {
            resource_type: "auto",
            use_filename: true,
            unique_filename: true
        }
        )
        console.log("File uploaded to Cloudinary:  ", response.url);
        //once the file is uploaded to cloudinary we can delete it from the server
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null
    }

}


const delete_from_cloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id)
        console.log("File deleted from Cloudinary:", public_id);

    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);

    }
}


export { upload_cloudinary }