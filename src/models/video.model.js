const mongoose = require('mongoose');
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String, // cloudinary url
        required: true,
    },
    thumbNail:{
        type: String,
        required: true,
    }, 
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    duration : {
        type: Number,
        required: true,
    },
    views: {
        type: Number, // cloudinary url
        default: 0,
    }, 
    isPublished:{
        type: Boolean,
        default: false,
    }, 
    owner: {
        type: mongoose.Schema.types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
});

videoSchema.plugin(mongoosePaginate);

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;