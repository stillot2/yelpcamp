var express                 = require("express"),
    router                  = express.Router(),
    Campground              = require("../models/campground"),
    User                    = require("../models/user"),
    middleware              = require("../middleware"),
    nodeGeocoder            = require("node-geocoder"),
    multer                  = require("multer"),
    cloudinary              = require("cloudinary");
    
// config for image upload using multer and cloudinary
var storage = multer.diskStorage({
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
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
cloudinary.config({
    cloud_name: "stillot2",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// config for google maps
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
    // add image
    cloudinary.uploader.upload(req.file.path, function(result){
        req.body.campground.image = result.secure_url;
        req.body.campground.imageId = result.public_id;
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        };
        // use google map api
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
            // create campground and update user.campgrounds[]
            Campground.create(req.body.campground, function(err, newlyCreated){
                if(err){
                    req.flash("error", err.message);
                    return res.redirect("back");
                } else {
                    User.findById(req.user._id, function(err, user){
                        if(err || !user){
                            req.flash("error", err.message);
                            return res.redirect("back");
                        } else {
                            user.campgrounds.push(newlyCreated);
                            user.save();
                            res.redirect("/campgrounds/"+newlyCreated.id);
                        }
                    });
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

//  UPDATE -- heavy route, could use refactor CIAO
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req,res){
    // update location using google api
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
        // pull campground to be updated from db
        Campground.findById(req.params.id, function(err, foundItem){
            if (err || !foundItem) {
                req.flash("error", "Campground not found");
                res.redirect("/campgrounds");
            } else {
                // if a new image has been uploaded, destroy old from hosted cloudinary
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
                                    // update and save
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
                    // no new image, update remaining and save
                    foundItem.name = req.body.campground.name;
                    foundItem.description = req.body.campground.description;
                    foundItem.price = req.body.campground.price;
                    foundItem.save();
                    req.flash("success", "Successfully updated");
                    res.redirect("/campgrounds/"+foundItem._id);
                }
            }
        });
    });
});


//  DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if (err){
            res.redirect("back");
        } else {
            // destroy image from cloudinary before delete
            cloudinary.v2.uploader.destroy(campground.imageId, function(err){
                if(err){
                    req.flash("error",err.message);
                    return res.redirect("back");
                } else {
                    campground.remove();
                    req.flash("success", "Successfully removed campground");
                    res.redirect("/campgrounds");
                }
            });
        }
    });
});


module.exports = router;