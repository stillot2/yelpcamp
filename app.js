require("dotenv").config();

var express             = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    Campground          = require("./models/campground"),
    Comment             = require("./models/comment"),
    seedDB              = require("./seeds"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    User                = require("./models/user"),
    methodOverride      = require("method-override");

var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    userRoutes          = require("./routes/users"),
    indexRoutes         = require("./routes/index");

   
mongoose.connect(process.env.DBURL);  
//mongoose.connect("mongodb://localhost/yelpcamp");  
//seedDB(); // seed the database
    
// config
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

// passport config
app.use(require("express-session")({
    secret: "this line can be anything",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// config variables
app.use(function(req,res,next){
    res.locals.currUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});




app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/users", userRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server spinning...");
});