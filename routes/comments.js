var express                 = require("express");
var router                  = express.Router({mergeParams: true});
var Campground              = require("../models/campground");
var Comment                 = require("../models/comment");
var User                    = require("../models/user");
var middleware              = require("../middleware");

//  COMMENTS ROUTES
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err || !campground){
            req.flash("error", "Campground was removed");
            res.redirect("back");
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

// comments create
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground by id
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err,comment){
                if(err){
                    console.log(err);
                } else {
                    User.findById(req.user._id, function(err, user){
                        if(err){
                            req.flash("error", err.message);
                            res.redirect("/campgrounds");
                        } else {
                            // add username and id to comment
                            comment.author.id = req.user._id;
                            comment.author.username = req.user.username;
                            comment.author.avatar = req.user.avatar;
                            // save comment
                            comment.save();
                            // add comment to both campground and user
                            campground.comments.push(comment);
                            user.comments.push(comment);
                            campground.save();
                            user.save()
                            res.redirect("/campgrounds/"+campground._id);
                        }

                    });
                }
            });
        }
    });
});

// edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err,foundCamp){
        if(err || !foundCamp){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            Comment.findById(req.params.comment_id, function(err, foundItem){
                if(err || !foundItem){
                    req.flash("error", "Comment not found");
                    res.redirect("back");
                } else {
                    res.render("comments/edit", {campground_id: req.params.id, comment: foundItem});
                }
            });
        }
    })

});

// update
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedItem){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// destroy
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //find by id and delete
    Comment.findById(req.params.comment_id, function(err, comment){
        if(err){
            res.redirect("back");
        } else {
            comment.remove();
            req.flash("success", "Review has been removed");
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
});



module.exports = router;