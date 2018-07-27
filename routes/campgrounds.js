var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");


// INDEX - show all
router.get("/",function(req,res){
    // fetch campgrounds from db
    Campground.find({}, function(err,allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {data:allCampgrounds, page:"campgrounds"});
        }
    });
});

// CREATE - add new item to database
router.post("/", middleware.isLoggedIn, function(req,res){
    var newCampground = {
        name: req.body.name,
        price: req.body.price,
        image: req.body.image, 
        description: req.body.description,
        author: {
            id: req.user._id,
            username: req.user.username 
        }
    };
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

// NEW - show form for new item
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

// SHOW - show info for selected item
router.get("/:id", function(req,res){
    // find item with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundItem){
        if(err || !foundItem){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            // render show template with given id
            res.render("campgrounds/show",{campground:foundItem});
        }
    });
});

//  EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, function(err, foundItem){
        if(err || !foundItem){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            res.render("campgrounds/edit", {campground: foundItem});            
        }
    });
});
//  UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedItem){
        if (err || !updatedItem) {
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


//  DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;