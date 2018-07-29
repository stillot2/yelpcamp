var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()){
        // is user logged in?
        Campground.findById(req.params.id, function(err, foundItem){
            if (err || !foundItem){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // is user owner? or admin?
                if(foundItem.author.id.equals(req.user._id)||(req.user.username==="admin")){
                    
                    next();
                } else {
                    req.flash("error", "Permission denied");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in first")
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()){
        // is user logged in?
        Comment.findById(req.params.comment_id, function(err, foundItem){
            if (err || !foundItem){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                // is user owner? or admin ciao
                if(foundItem.author.id.equals(req.user._id)||(req.user.username==="admin")){
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login first")
    res.redirect("/login");
};


module.exports = middlewareObj;