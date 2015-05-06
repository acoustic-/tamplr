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

            models.BlogPost.findAll({order: '"createdAt" DESC'}).then(function(posts) {
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

                          user.getScribbledUser().then(function(scribbledusers) {

                            models.Blog.findAll().then(function(blogs) {
                              console.log("mooror");
                                res.render('index', {
                                    host: req.headers.host,
                                    user: user,
                                    follows: follows,
                                    authored: authored,
                                    blogs: blogs,
                                    posts: postsArr,
                                    users: users,
                                    scribbled: scribbledusers
                                });
                            });
                        });
                    });
                });
              });
            });
        } else {
            models.BlogPost.findAll({order: '"createdAt" DESC'}).then(function(posts) {
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
router.post('/scribble', function(req, res) {


    //mitä jos yrittää maalaa omaa kuvaa
    console.log("MOSMOSD");
    var authorID = req.body.authorID; //töhrittävä
    console.log("tohrittava "+authorID);
    //var authorPic = req.body.author_profile_pic //töhrittävän kuva
    var userID = req.user; //töhrijä

    console.log("tohrijaID "+userID);


    var query1 = {where: {id: userID}};
    var query2 = {where: {id: authorID}};
    // console.log("lalalalaa: ", req.user.id);

    models.User.findOne(query1).then(function(user) {

      if(!user) { // user doesn't exist
          return res.status(404).json({error:'UserNotFound'});
      }
      user.getScribbledUser({ where: {scribbled_id: authorID }}).then(function(scribbledusers)
      {
          console.log( "pituus: "+scribbledusers.length)
          if (scribbledusers.length > 0)
          {
            //console.log(scribbledusers[0].scribbled_img);
            res.render('scribble.ejs', {
                author: authorID,
                user: userID,
                author_pic: scribbledusers[0].scribbled_img
            });
          }
          else
          {
            models.User.findOne(query2).then(function(user2) {
              res.render('scribble.ejs', {
                  author: authorID,
                  user: userID,
                  author_pic: user2.profile_picture
              });
            });
          }
      });
    });

});



// Luo tili -painike
router.get('/register', function(req, res) {

    res.render('register.ejs');

});

router.get('/settings', function(req, res) {

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
