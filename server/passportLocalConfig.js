const User = require("./models/user");
const localStrategy = require("passport-local")

module.exports = function (passport) {
    //Makes passport local-authentication work
    passport.use(new localStrategy(User.authenticate()));

    //give instructions on how to store a user in the session
    passport.serializeUser(User.serializeUser());

    //give instructions on how to remove a user from the session
    passport.deserializeUser(User.deserializeUser());

};

