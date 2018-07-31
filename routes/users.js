var express             = require("express");
var router              = express.Router();
var Campground          = require("../models/campground");
var User                = require("../models/user");
var middleware          = require("../middleware");

// USER SHOW
router.get("/:user_id", function(req, res){
    User.findById(req.params.user_id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error",req.params.user_id+"..type:"+typeof(req.params.user_id));
            res.redirect("back");
        } else {
            Campground.find().where("author.id").equals(foundUser._id).exec(function(err,campgrounds){
                if (err){
                    req.flash("error", "Something went wrong");
                    res.redirect("back");
                } else {
                    res.render("users/show",{user: foundUser, campgrounds:campgrounds});
                }
            });
        }
    });
});

// USER EDIT
router.get("/:user_id/edit", middleware.checkUserOwnership, function(req,res){
    User.findById(req.params.user_id, function(err, user){
        if(err || !user){
            req.flash("error", "User not found");
            res.redirect("back");
        } else {
            res.render("users/edit", {user: user});            
        }
    });
});

// USER UPDATE
router.put("/:user_id/", middleware.checkUserOwnership, function(req, res){
    User.findById(req.params.user_id, function(err,user){
        if(err){
            req.flash("error",err.message);
            res.redirect("back");
        } else {
            user.fname = req.body.fname;
            user.lname = req.body.lname;
            user.email = req.body.email;
            user.avatar = req.body.avatar;
            user.save();
            res.redirect("/users/"+req.params.user_id);
        }
    });
});

// USER DESTROY
router.delete("/:user_id", middleware.checkUserOwnership, function(req, res){
    User.findById(req.params.user_id, function(err, user){
        if (err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            user.remove();
            req.flash("success", "Successfully deleted account");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;