var Campground      = require("../models/campground");
var Comment         = require("../models/comment");

// Middleware for robust routing

var middlewareObj = {};


/*
* checkCampgroundOwnership
* inputs:   request, response, next
* outputs:  none
* behavior: middleware for handling the 
*           http response after verify
*           the request is sent by owner/admin
*/
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

// verification for request sender to be specific User or Admin
/*
* checkUserOwnership
* inputs:   request, response, next
* outputs:  none
* behavior: middleware for handling the 
*           http response after verification
*           of "user" ownership
*/          
middlewareObj.checkUserOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.params.user_id === req.user.id || req.user.username==="admin"){
            next();
        } else {
            req.flash("error", "Permission denied");
            res.redirect("back");
        }
    } else {
        res.redirect("back");
    }
};

// verification for request sender to be specific User or Admin
/*
* checkCommentOwnership
* inputs:   request, response, next
* outputs:  none
* behavior: middleware for handling the 
*           http response after verification
*           of "comment" ownership.  only 
*           owner/admin can edit/remove.
*/  
middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()){
        // is user logged in?
        Comment.findById(req.params.comment_id, function(err, foundItem){
            if (err || !foundItem){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                // is user owner? or admin
                if(foundItem.author.id.equals(req.user._id)||(req.user.username==="admin")){
                    next();
                } else {
                    req.flash("error", "Permission denied");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login or sign up first");
        res.redirect("back");
    }
};

// verification for funtionality designated only for authenticated users
middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login first")
    res.redirect("/login");
};


module.exports = middlewareObj;