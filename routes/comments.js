var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//  COMMENTS ROUTES
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
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
            req.flash("error", err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err,comment){
                if(err){
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.avatar = req.user.avatar;
                    // save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/"+campground._id);
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
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Review has been removed");
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
});



module.exports = router;