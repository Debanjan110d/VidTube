import { v2 as cloudinary } from "cloudinary"
import { log } from "console"
import fs from "fs"//file system from node.js default

//cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const upload_cloudinary = async (localFilePath) => {// localhere means the path of that thing in the server
    try {
        if (!localFilePath) {
            return null
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        }
        )
        console.log("File uploaded to Cloudinary:  ", response.url);
        //once the file is uploaded to cloudinary we can delete it from the server
        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }

}


export { upload_cloudinary }