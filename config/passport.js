// This file is used to authenticate user and it has
// all functionality that is responsible for correct response
// to valid or invalid user authentication

var LocalStrategy = require('passport-local').Strategy;

// load user model

var models = require('../models');
module.exports = function(passport) {
    
    // validate user for the duration of sessios
    passport.serializeUser(function(user, done) {
        console.log("serializeUser called");
        done(null, user.id);
    });
    
    // remove user validation
    passport.deserializeUser(function(id, done) {
        console.log("deserializeUser called");
        models.User.find({where: {id: id}})
        .then(function(err, user) {
            done(err, user) 
        }
        )
    });

    passport.use(new LocalStrategy({
        username: 'username',
        password: 'password'
    },
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
}

