var mongoose = require("mongoose");
 
var commentSchema = new mongoose.Schema({
    text: String,
    rating: Number,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        avatar: String
    }
});
 
module.exports = mongoose.model("Comment", commentSchema);