var express = require('express');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var models = require('../models');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
//var BasicStrategy = require('passport-http').BasicStrategy;

var basicAuth = passport.authenticate('basic', {session: false});
var localAuth = passport.authenticate('local', {session: false});

//add user
router.post('/', function(req, res, next) {

  var username = req.body.username;
  var name = req.body.name;
  var password = req.body.password;
  if (!username || !password || !name ) {
    return res.status(400).json({error: 'InvalidUserName'});
  }

    // check if username previously exists
  var query = {where: {username: username}};
  models.User.findOne(query).then(function(user) {
    if (user) {
      return res.status(409)
      .json({error:'UserAlreadyExists'});
    } else {
        models.User.create({
        username: username,
        name: name,
        password: password
        }).then(function(user) {
            return res.status(201);
        }),
        function(err) {
            return res.status(500).json({error: 'ServerError'});
        };
    }
  });
});


//get user information
//ensureLoggedIn('/login') == check that user is logged, if redirect to login page
//router.get('/:username', ensureLoggedIn('/login'), function(req, res) {
//res.render('/:username');
//});

router.get('/:username', requiredAuthentication, function(req, res, next) {
  var username = req.params['username'];
  var query = {where: {username: username}};
    console.log("lalalalaa: ", req.user.id);
  models.User.findOne(query).then(function(user) {
    if (user) {
      return res.status(200).json(user.toJson());
    }
    else {

      return res.status(404).json({error: 'UserNotFound'});
    }
  });
  // router.put
});

//patch user's information

router.put('/:username', requiredAuthentication, function(req, res, next) {
    var username = req.params['username'];
    var name = req.body.name;
    var password = req.body.password;
    var id = req.user.dataValues.id;
     
    // check if the request is in correct form
    if (!name && !password) {
        return res.status(400).json({error: 'EmptyField'});
    }
    
    // check if user exists
    var query = {where: {username: username}};
    models.User.findOne(query).then(function(user) {
        if(!user) { // user doesn't exist
            return res.status(404).json({error:'UserNotFound'});
        }
        if (user.id == id) { // user is modifying one's own information
            if(name) {models.User.name = name;}
            if(password) {models.User.password = password;}
            return res.status(200).json(user.toJson());
        }
        else {
            return res.status(403).json({error: 'InvalidAccessrights'});
        }
    });
    
});

router.get('/:username/blogs', requiredAuthentication, function(req, res, next) {
    var username = req.params['username'];
    console.log("get blogs");
    models.User.findOne({where: {username: username}})
        .then(function(user) {
        console.log("user found!");
        //models.User.getAuthoredBlogs({where: {username: username}});
        //user.getAuthoredBlogs().then(function(blogs) {
        user.getAuthoredBlogs().then(function(blogs){
            
            console.log("blogs: ", blogs.length);
            for(var i = 0; i < blogs.length; ++i) {
                console.log(blogs[i].id);
                blogs[i] = {id: blogs[i].id};
            
            }
            return res.status(200).json(blogs);
        });
    }) .catch(function(err) {
        return res.status(404).json({error: 'UserNotFound'});
    });
                                                           
});

/*
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
*/

function requiredAuthentication(req, res, next) {
    if (req.user) {
        next();
    } else {
        basicAuth(req, res, next);
    }
}


module.exports = router;
