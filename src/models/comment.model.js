const { default: mongoose } = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

videoSchema.plugin(aggregatePaginate);

const comment = mongoose.model("Comment", commentSchema);

module.exports = comment;