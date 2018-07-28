var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String
    // avatar: String,
    // fname: String,
    // lname: String,
    // email: String
});

userSchema.plugin(passportLocalMongoose); //add methods to user schema

module.exports = mongoose.model("User", userSchema);