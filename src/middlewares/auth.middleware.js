const User = require("../models/user.model.js");
const ApiError = require("../utils/apiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require('jsonwebtoken');

const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('authorization')?.replace("bearer ", "");
        console.log(token);
        if (!token) {
            console.log("Token error");
            new ApiError(401, "Unauthorized request");
            // return res.status(401).json({success: false, message:"Unauthorized request"});
        }
        const decoded_token = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = User.findById(decoded_token?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Unauthorized request");
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("error in auth middleware ", error);
        throw new ApiError(401, error?.message || "Invalid access token")
    }
});

module.exports = verifyJwt;