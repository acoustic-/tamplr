var express = require('express');
var router = express.Router();
var passport = require('passport');

var models = require('../models');
var basicAuth = passport.authenticate('basic', {session: false});

var registered_user;


router.get('/', function(req, res, next) {
    /* models.User.findAll().then(function(users) {
    res.render('index', {
      host: req.headers.host,
      users: users
    });
  });*/
    models.User.findAll().then(function(users) {
        if(req.user) { // käyttäjä kirjautunut sisään

            models.BlogPost.findAll({order: 'createdAt DESC'}).then(function(posts) {
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


                        //user.getAuthoredBlogs().then(function(blogs){
                        user.getFollowedBlogs().then(function(follows) {
                            models.Blog.findAll().then(function(blogs) {

                                res.render('index', {
                                    host: req.headers.host,
                                    user: user,
                                    follows: follows,
                                    authored: authored,
                                    blogs: blogs,
                                    posts: postsArr,
                                    users: users
                                });
                            });
                        });
                    });
                });

            });
        } else {
            models.BlogPost.findAll({order: 'createdAt DESC'}).then(function(posts) {
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
                        posts: postsArr,
                        users: users
                    });
                });

            });
        }
    });
});


// töherrä
router.get('/scribble', function(req, res) { 

    res.render('scribble.ejs');

});



// Luo tili -painike
router.get('/register', function(req, res) { 

    res.render('register.ejs');

});

router.get('/settings', function(req, res) {

    //if(req.user) {
    models.User.findOne({where: {id: req.user }}).then(function(user) {

        //console.log(user.get('username')+" moro");
        res.render('settings.ejs', {
            user: user
        }); 
    });    

});


router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});



function requiredAuthentication(req, res, next) {

    if (req.user) {
        registered_user = req.user;
        next();
    } else {
        basicAuth(req, res, next);
    }
}

module.exports = router;
