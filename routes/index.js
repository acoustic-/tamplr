var express = require('express');
var router = express.Router();
var passport = require('passport');

var models = require('../models');
var basicAuth = passport.authenticate('basic', {session: false});


router.get('/', function(req, res, next) {
 /* models.User.findAll().then(function(users) {
    res.render('index', {
      host: req.headers.host,
      users: users
    });
  });*/
    if(req.user) { // käyttäjä kirjautunut sisään
        console.log("user id: ", req.session.passport.user );
        models.BlogPost.findAll().then(function(posts) {
            var postsMax = 0;
            var postsArr = [];

            if (posts.length > 10 ) {
                postsMax = 10;
            } else {
                postsMax = posts.length;
            }

            for (var i = 0; i < postsMax; ++i) {
                postsArr[i] = posts[i];
            }
            
            
            models.User.findOne({where: {id: req.session.passport.user }}).then(function(user) {
                
                user.getAuthoredBlogs().then(function(authored) {
                    console.log("authored blogs len: ", authored.length);
                    console.log("authored: ", authored[0].dataValues.id);
                  
              //user.getAuthoredBlogs().then(function(blogs){
                    user.getFollowedBlogs().then(function(follows) {
                        models.Blog.findAll().then(function(blogs) {
                            res.render('index', {
                                host: req.headers.host,
                                user: user,
                                follows: follows,
                                authored: authored,
                                blogs: blogs,
                                posts: postsArr
                            });
                        });
                    });
                });
            });

        });
    } else {
        models.BlogPost.findAll().then(function(posts) {
            var postsMax = 0;
            var postsArr = [];

            if (posts.length > 10 ) {
                postsMax = 10;
            } else {
                postsMax = posts.length;
            }

            for (var i = 0; i < postsMax; ++i) {
                postsArr[i] = posts[i];
            }

            models.Blog.findAll().then(function(blogs) {

                res.render('index_unlogged', {
                    host: req.headers.host,
                    blogs: blogs,
                    posts: postsArr
                });
            });

        });
    }
});


// Luo tili -painike
router.get('/create_user', function(req, res) { 
    res.render('create_user.ejs'); 
      
});


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});



function requiredAuthentication(req, res, next) {
    console.log("authentication!", req.user);
    if (req.user) {
        next();
    } else {
        basicAuth(req, res, next);
    }
}

module.exports = router;
