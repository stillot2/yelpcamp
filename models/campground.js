var mongoose      = require("mongoose");
var Comment       = require("./comment");

// schema for each campground 
var campgroundSchema = new mongoose.Schema({
   name: String,
   price: String,
   image: String,
   imageId: String, // for cloudinary removal
   url: String,
   description: String,
   location: String,
   lat: Number, // for google api
   lng: Number, // for google api
   createdAt: { type: Date, default: Date.now }, // for moments
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
      avatar: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

//helper function for cascading delete with dependencies
campgroundSchema.pre("remove", async function(next){
   try{
      await Comment.remove({
         "_id": {
            $in: this.comments
         }
      });
      next();
   } catch (err) {
      next(err);
   }
});


 
module.exports = mongoose.model("Campground", campgroundSchema);