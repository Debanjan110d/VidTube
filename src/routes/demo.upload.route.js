import { Router } from "express";
//Demo route for file upload functionality

import { upload_cloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const router = Router();

// Demo upload endpoint - accepts file and uploads to Cloudinary
router.route("/demo-upload").post(async (req, res) => {
    try {
        // In real implementation, you'd use multer middleware here
        // For demo: assuming file is already saved locally (e.g., public/temp/demo-file.jpg)
        const localFilePath = "./public/temp/demo-file.jpg"; // Demo file path

        // Check if demo file exists
        if (!fs.existsSync(localFilePath)) {
            return res.status(400).json({
                success: false,
                message: "Demo file not found. Please add a demo file to public/temp/"
            });
        }

        // Upload to Cloudinary using our utility
        const cloudinaryResponse = await upload_cloudinary(localFilePath);

        if (!cloudinaryResponse) {
            return res.status(500).json({
                success: false,
                message: "File upload failed"
            });
        }

        // Success response with Cloudinary URL
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: {
                url: cloudinaryResponse.url,
                public_id: cloudinaryResponse.public_id,
                resource_type: cloudinaryResponse.resource_type
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Upload error: " + error.message
        });
    }
});

// Demo route to simulate multer + cloudinary workflow
router.route("/upload-workflow").post(async (req, res) => {
    try {
        // This simulates the complete upload workflow:
        // 1. Multer saves file locally (temp storage)
        // 2. Cloudinary uploads and returns URL
        // 3. Local file gets deleted automatically
        // 4. Database saves the Cloudinary URL

        res.status(200).json({
            success: true,
            message: "Upload workflow demo",
            workflow: [
                "1. Frontend sends file via form-data",
                "2. Multer middleware saves to local temp folder",
                "3. Cloudinary utility uploads file",
                "4. Local temp file deleted automatically",
                "5. Cloudinary URL saved to database",
                "6. Response sent with public URL"
            ],
            next_steps: [
                "Install multer: npm i multer",
                "Create multer middleware",
                "Integrate with user/video controllers",
                "Add file validation (size, type)",
                "Implement database saving"
            ]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
