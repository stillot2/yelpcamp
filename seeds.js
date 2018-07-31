var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment   = require("./models/comment");
var User = require("./models/user");

// actually a teardown of db
function seedDB(){
    Campground.find({}, function(err, sites){
        sites.forEach(function(x){
            x.delete();
        });
    });
//   Campground.remove({}, function(err){
//         if(err){
//             console.log(err);
//         }
//         console.log("removed campgrounds!");
//         Comment.remove({}, function(err) {
//             if(err){
//                 console.log(err);
//             }
//             console.log("removed comments!");
//                 User.remove({}, function(err) {
//                     if(err){
//                         console.log(err);
//                     }
//                     console.log("removed users!");
//             });
//         });
//     }); 
}
 
module.exports = seedDB;