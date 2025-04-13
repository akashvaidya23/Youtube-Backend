const jwt = require('jsonwebtoken');
const User = require("../models/user.model.js");
const ApiError = require("../utils/apiError.js");
const ApiResponse = require("../utils/apiResponse.js");
const asyncHandler = require("../utils/asyncHandler.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        let user = await User.findById(userId);
        const accessToken = user.generateAccessToken(user.password);
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (err) {
        console.log(err);
        throw new ApiError(500, "Something went wrong");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // 1. Get user details
    // 2. Validate the data
    // 3. Check if the user already exists from email
    // 4. Check for images
    // 5. Check for avatars
    // 6. Upload the image to cloudinary
    // 7. Remove password and refresh token
    // 8. Check if user is created. if not throw error
    try {
        // console.log(req.body);
        let { email, phone, firstName, lastName, password } = req.body;
        // if(firstName == ""){
        //     throw new ApiError(400,"First Name is required");
        // }
        console.log(req.files);
        if ([firstName, lastName, phone, email, password].some((field) => {
            return field.trim() == ""
        })) {
            throw new ApiError(400, "All fields are required");
        }
        // console.log({email, password});

        let existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new ApiError(400, "User already exists");
        }

        if (!req.files.avatar) {
            throw new ApiError(400, "Avatar is required");
        }

        // const avatarLocalFiles = req.files?.avatar[0]?.path;
        // const coverImageLocalFiles = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        let avatarLocalPath;
        if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarLocalPath = req.files.avatar[0].path;
        }

        const coverImageUploaded = await uploadOnCloudinary(coverImageLocalPath);
        const avatarUploaded = await uploadOnCloudinary(avatarLocalPath);

        if (!avatarUploaded) {
            throw new ApiError(400, "Cover Image upload failed");
        }

        const user = {
            firstName,
            lastName,
            email,
            phone,
            password,
            avatar: avatarUploaded?.url,
            coverImage: coverImageUploaded?.url
        }

        let createdUser = await User.create(user);

        createdUser = await User.findById(createdUser._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            throw new ApiError(500, "User registration failed");
        }

        return res.status(201).json(
            new ApiResponse(200, "User registered Successfully", createdUser)
        )
        // res.status(200).json({
        //     user: createdUser,
        //     success: true,
        //     message: "User registered successfully",
        // });
    } catch (err) {
        console.log(err);
        throw new ApiError(500, "User registration failed");
        // res.status(500).json({
        //     err,
        //     success: false,
        //     message: "User registration failed",
        // });
    }
});

const loginUser = asyncHandler(async (req, res) => {
    // send token via cookies
    const { email, username, password } = req.body;
    if (!email && !username) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.
        status(200).
        cookie("accessToken", accessToken, options).
        cookie("refreshToken", refreshToken, options).
        json(
            new ApiResponse(200,
                "User logged In Successfully",
                {
                    loggedInUser
                }
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const id = req.user._id;
    const user = User.findByIdAndUpdate(id, {
        $set: {
            refreshToken: undefined
        }
    },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200).
        clearCookie("accessToken", options).
        clearCookie("refreshToken", options).
        json(
            new ApiResponse(200, "User logged out")
        );
});

const refreshAccessToken = asyncHandler(async (req, resp) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized Request");
        }
        const decodedtoken = jwt.verify(incomingRefreshToken, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedtoken._id);
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        };
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return resp.
            status(200).
            cookie("asccessToken", options, accessToken).
            cookie("refreshToken", options,  refreshToken).
            json(
                new ApiResponse(
                    200,
                    "Access token refreshed successfully",
                    {
                        accessToken, refreshToken
                    },
                )
            )
    } catch (error) {
        console.log(error);
        new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changePassword = asyncHandler(async (req, resp) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password");
    }
    user.password = newPassword;
    await user.save({
        validateBeforeSave: false
    });
    return resp.status(200).json(
        new ApiResponse(200, "Password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, resp) => {
    return resp.status(200).json(200, "Current user fetched successully", req.user);
});

const updateUserAvatar = asyncHandler(async (req, resp) => {
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id, {
            $set:{
                avatar: avatar.url
            }
        }, {
            new: true
        }
    ).select("-password");

    return resp.status(200).json(
        new ApiResponse(200, "Cover Image updated successfully", user)
    );
});

const updateUserCoverImage = asyncHandler(async (req, resp) => {
    const CoverImageLocalPath = req.file?.path;
    if(!CoverImageLocalPath) {
        throw new ApiError(400, "CoverImage file is missing");
    }

    const CoverImage = await uploadOnCloudinary(CoverImageLocalPath);
    if(!CoverImage.url){
        throw new ApiError(400, "Error while uploading cover image");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id, {
            $set:{
                CoverImage: CoverImage.url
            }
        }, {
            new: true
        }
    ).select("-password");

    return resp.status(200).json(
        new ApiResponse(200, "Cover Image updated successfully", user)
    );
});

module.exports = {
    registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateUserAvatar, updateUserCoverImage
}