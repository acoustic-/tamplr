// This file is used to authenticate user and it has
// all functionality that is responsible for correct response
// to valid or invalid user authentication

var LocalStrategy = require('passport-local').Strategy;
var options = {realm: "tamplr"};
var BasicStrategy = require('passport-http').BasicStrategy;
// load user model
var User            = require('../models/user');
var models = require('../models');

// expose this function to our app using module.exports
module.exports = function(passport) {
    
    // validate user for the duration of sessios
    /*
    passport.serializeUser(function(user, done) {
        console.log("serializeUser called");
        done(null, user.id);
    });
    
    // remove user validation
    passport.deserializeUser(function(id, done) {
      models.User.find({where: {id: id}}).success(function(user){
        done(null, user);
      }).error(function(err){
        console.log("error");
        done(err, null);
      });
    });
    */
    passport.use(new BasicStrategy(
        function(username, password, done) {
            models.User.findOne({where: {username: username }})
                .success(function(user) {
                console.log(username);
                console.log(password);
                if (!user) {
                    console.log("testi2");
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if(!user.validatePassword(password)) {
                    return done(null, false, {message: 'Incorrect password.' });
                }
                console.log("user found");
                
                return done(null, user, {message: 'Authentication was correct.' });

            })
        }
    ));
    
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'     
    },  function(username, password, done) {
            models.User.findOne({where: {username: username }})
                .success(function(user) {
                console.log(username);
                console.log(password);
                if (!user) {
                    console.log("testi2");
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if(!user.validatePassword(password)) {
                    return done(null, false, {message: 'Incorrect password.' });
                }
                console.log("user found");
                return done(null, user, {message: 'Authentication was correct.' });

            })
        }
    ));
    
    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    // Deserialisointi session-muuttujasta
    passport.deserializeUser(function(user, done) {
      done(null, user);
    });
}

