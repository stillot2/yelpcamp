var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var passport = require("passport");

//landing page
router.get("/",function(req,res){
    res.render("landing");
});

router.get("/register",function(req,res){
    res.render("register", {page: "register"});
});

// sign up logic
router.post("/register", function(req,res){
    var newuser = new User(
        {
            username: req.body.username,
            avatar: req.body.avatar,
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email
        });
    User.register(newuser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register", {page: "register"});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Nice to meet you, "+user.username);
            res.redirect("/campgrounds");
        });
    });
});

router.get("/login", function(req,res){
    res.render("login", {page: "login"});
});
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req,res){
});

router.get("/logout", function(req, res){
    req.logout();
    req.flash("succes", "Goodbye");
    res.redirect("/campgrounds");
});

/////////////////////
// admin page
router.get("/admin", function(req, res){
    if(req.user.username === "admin"){
        // find all users
        User.find({}, function(err,users){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            // users.forEach(  function(user){
            //     Campground.find().where("author.id").equals(user._id).exec(function(err,campgrounds){
            //         if (err){
            //             req.flash("error", "Something went wrong");
            //             res.redirect("back");
            //         } else {
            //             Comment.find().where("author.id").equals(user._id).exec(function(err,comments){
            //                 if (err){
            //                     req.flash("error", "Something went wrong");
            //                     res.redirect("back");
            //                 } else {
            //                     user.camps = [];
            //                     user.comms = [];
            //                     user.camps.push(campgrounds);
            //                     user.comms.push(comments);
            //                     console.log(campgrounds);
            //                     console.log(comments);
                                
            //                 }
            //             });
            //         }
            //     });
        
            // });
          res.render("admin/show", {data:users, page:"admin"});
        }
        
       
    });
    } else {
        req.flash("error", "Must be admin to view here");
        res.redirect("back");
    };
});

// user profile
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error","User not found");
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

module.exports = router;