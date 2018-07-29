var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var nodeGeocoder = require("node-geocoder");

var multer = require("multer");
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    //accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed"), false);
    }
    cb(null,true);
};
var upload = multer({storage: storage, fileFilter: imageFilter});


var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: "stillot2",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = nodeGeocoder(options);

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
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req,res){
    cloudinary.uploader.upload(req.file.path, function(result){
        req.body.campground.image = result.secure_url;
        req.body.campground.imageId = result.public_id;
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        };
        geocoder.geocode(req.body.campground.location, function(err,data){
            if(err || !data.length){
                req.flash("error","Invalid address");
                return res.redirect("back");
            }
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;
            req.body.campground.lat = lat;
            req.body.campground.lng = lng;
            req.body.campground.location = location;
            // cloudinary
            Campground.create(req.body.campground, function(err, newlyCreated){
                if(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                } else {
                    res.redirect("/campgrounds/"+newlyCreated.id);
                }
            });
        });
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
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req,res){
    // cloudinary.uploader.upload(req.file.path, function(result){
    //     req.body.campground.image = result.secure_url;
    //     req.body.campground.author = {
    //         id: req.user._id,
    //         username: req.user.username,
    //         avatar: req.user.avatar
    //     };
        geocoder.geocode(req.body.campground.location, function(err,data){
                if(err || !data.length){
                    req.flash("error",err.message);
                    return res.redirect("back");
                }
                var lat = data[0].latitude;
                var lng = data[0].longitude;
                var location = data[0].formattedAddress;
                req.body.campground.lat = lat;
                req.body.campground.lng = lng;
                req.body.campground.location = location;
            // Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedItem){
            //     if (err || !updatedItem) {
            //         req.flash("error", "Campground not found");
            //         res.redirect("/campgrounds");
            //     } else {
            //         res.redirect("/campgrounds/" + req.params.id);
            //     }
            // });
            Campground.findById(req.params.id, function(err, foundItem){
                if (err || !foundItem) {
                    req.flash("error", "Campground not found");
                    res.redirect("/campgrounds");
                } else {
                    if(req.file){
                        cloudinary.v2.uploader.destroy(foundItem.imageId, function(err){
                            if(err){
                                req.flash("error",err.message);
                                return res.redirect("back");
                            } else {
                                cloudinary.v2.uploader.upload(req.file.path, function(err,result){
                                    if(err){
                                        req.flash("error",err.message);
                                        return res.redirect("back");
                                    } else {
                                        foundItem.imageId = result.public_id;
                                        foundItem.image = result.secure_url;
                                        foundItem.name = req.body.campground.name;
                                        foundItem.description = req.body.campground.description;
                                        foundItem.price = req.body.campground.price;
                                        foundItem.save();
                                        req.flash("success", "Successfully updated");
                                        res.redirect("/campgrounds/"+foundItem._id);
                                    }
                                })
                            }
                        })
                    } else {
                        foundItem.name = req.body.campground.name;
                        foundItem.description = req.body.campground.description;
                        foundItem.price = req.body.campground.price;
                        foundItem.save();
                        req.flash("success", "Successfully updated");
                        res.redirect("/campgrounds/"+foundItem._id);
                    }
                    //res.redirect("/campgrounds/" + req.params.id);
                }
            });
        });
    // });
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