const User = require("../models/user.model.js");
const ApiError = require("../utils/apiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require('jsonwebtoken');

const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('authorization')?.replace("bearer ", "");
        if (!token) {
            new ApiError(401, "Unauthorized request");
        }
        const decoded_token = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = User.findById(decoded_token?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Unauthorized request");
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        throw new ApiError(401, "Invalid access token");
    }
});

module.exports = verifyJwt;