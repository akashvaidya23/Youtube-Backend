const { Router } = require("express");
const { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } = require("../controllers/user.controller.js");
const router = Router();
const upload = require("../middlewares/multer.middleware.js");
const  verifyJwt = require("../middlewares/auth.middleware.js");

router.route("/").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);


router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt, changePassword);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
router.route("/coverImage").patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);
router.route("/channel-history/:username").get(verifyJwt, getUserChannelProfile);
router.route("/watch-history").get(verifyJwt, getWatchHistory);

module.exports = router;