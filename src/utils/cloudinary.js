const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(filePath);
        // console.log("File is uploaded successfully ", response);
        return response;
    } catch (Err) {
        console.log("Unable to upload file ", Err);
        // Removes locally saved temp file
        fs.unlinkSync(filePath);
        return null;
    }
}

// Upload an image
// const uploadResult = await v2.uploader.upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//     public_id: 'shoes',
// }).catch((error) => {
//     console.log(error);
// });

// console.log(uploadResult);

module.exports = { uploadOnCloudinary }