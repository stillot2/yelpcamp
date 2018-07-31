var mongoose                = require("mongoose");
var passportLocalMongoose   = require("passport-local-mongoose");
var Comment                 = require("./comment");
var Campground              = require("./campground");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    fname: String,
    lname: String,
    email: String,
    campgrounds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campground"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

// helper function for removing cascading dependencies
userSchema.pre("remove", async function(next){
   try{
      await Comment.remove({
         "_id": {
            $in: this.comments
         }
      });
      await Campground.remove({
         "_id": {
            $in: this.campgrounds
         }
      });
      next();
   } catch (err) {
      next(err);
   }
});

userSchema.plugin(passportLocalMongoose); //add methods to user schema

module.exports = mongoose.model("User", userSchema);