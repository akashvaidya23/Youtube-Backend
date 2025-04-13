// const asyncHandler = (fn) => async (req, resp, next) => {
//     try {
//         await fn(req, resp, next);
//     } catch (error) {
//         console.error(error);
//         resp.status(error.code || 500).json({ 
//             success: false, 
//             message: "Internal Server Error" 
//         });
//     }
// };

const asyncHandler = (fn) => {
    return (req, resp, next) => {
        Promise.resolve(fn(req, resp, next)).catch((err) => next(err));
    }
}

module.exports = asyncHandler;