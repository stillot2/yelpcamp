var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");

//landing page
router.get("/",function(req,res){
    res.render("landing");
});

router.get("/register",function(req,res){
    res.render("register", {page: "register"});
});
router.post("/register", function(req,res){
    var newuser = new User({username: req.body.username});
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

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

////////////////////////////

module.exports = router;