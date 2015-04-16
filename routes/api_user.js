var express = require('express');
var sequelize = require('sequelize');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var models = require('../models');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
//var BasicStrategy = require('passport-http').BasicStrategy;

var basicAuth = passport.authenticate('basic', {session: false});
var localAuth = passport.authenticate('local', {session: false});

var registered_user;

//add user
router.post('/', function(req, res, next) {
  
  
  var username = req.body.username;
  var name = req.body.name;
  var password = req.body.password;
  if (!username || !password || !name ) {
    return res.status(400).json({error: 'InvalidUserName'});
  }
  // check if user is logged in
    //console.log("pidempi: ", req.user.dataValues.id);
    //console.log("lyhyempi: ", req.user.id);

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
            //add default blog to user
            models.Blog.create({
                name: 'Default blog'
            }).then(function(blog){
                blog.addAuthor(user.get('id')).then(function(blog) {
                    console.log("User was added as author to default blog"); 
                }, function (err) {
                    return res.status(500).json({error: 'ServerError'});
                });
                return res.status(201).json(user);
            }, function (err) {
                return res.status(500).json({error: 'ServerError'});
            });
        });
    }   
    });
});



//get user information
//ensureLoggedIn('/login') == check that user is logged, if redirect to login page
//router.get('/:username', ensureLoggedIn('/login'), function(req, res) {
//res.render('/:username');
//});

router.get('/:username', function(req, res, next) {
  var username = req.params['username'];
  var query = {where: {username: username}};
   // console.log("lalalalaa: ", req.user.id);
  models.User.findOne(query).then(function(user) {
    if (user) {
      return res.status(200).json(user);
    }
    else {

      return res.status(404).json({error: 'UserNotFound'});
    }
  }, function (err) {
    return res.status(500).json({error: 'ServerError'});
  });
  // router.put
});

//patch user's information
router.put('/:username', requiredAuthentication, function(req, res, next) {
    console.log("starting put..");
    var username = req.params['username'];
    var namefield = req.body.name;
    var password = req.body.password;
    var id = req.user.dataValues.id;

    console.log("USERNAME "+username);
    console.log("NAMEFIELD" + namefield);
    console.log("PASSWORD" + password);

    // check if the request is in correct form
    /*
    if (!namefield || !password) {
        console.log("TAALLA");
        return res.status(400).json({error: 'EmptyField'});
    }
    */
    //if we have given new username or password, check they are not empty.
    console.log("TAALLA1");
    if ( namefield && namefield == "" ) {
        console.log("TAALLA2");
        return res.status(400).json({error: 'EmptyField'});
    }

    if ( password && password == "" ) {
        console.log("TAALLA3");
        return res.status(400).json({error: 'EmptyField'});
    }

    // check if user exists
    var query = {where: {username: username}};
    models.User.findOne(query).then(function(user) {
        if(!user) { // user doesn't exist
            return res.status(404).json({error:'UserNotFound'});
        }
        if (user.get('id') == id) { // user is modifying one's own information
            console.log("modifyname: ", namefield);
            console.log("modifypass: ", password);
            
            if(namefield) {user.updateAttributes({name: namefield}).then(function(user_) {console.log("username patch")})};
            if(password)  {user.updateAttributes({password: password}).then(function(user_) {console.log("passw patch")})};
            //user.sync();
            console.log("user patched");
            models.User.findOne(query).then(function(user){res.status(200).json(user.toJSON())});
        } else {
           res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
           return res.status(403).json({error: 'InvalidAccessrights'}); 
        }
    }, function(err) {
         return res.status(500).json({error: 'ServerError'});   
    });
    
});

router.get('/:username/blogs', function(req, res, next) {
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

// like someone's blogpost
// muista palauttaa jotai (esim. return res.status(200).json(------->"moro"<----); ) koska muuten POST ei palauta mitaan !!!!!!!!!!!!!!!!!!!!!!!!!!!
router.put('/:username/likes/:id', requiredAuthentication, function(req, res, next) {

    var username = req.params['username'];
    var blogpostid = req.params['id'];
    var userID = req.user.dataValues.id;


    //var namefield = req.body.name;
    //var password = req.body.password;
    //var id = req.user.dataValues.id;
    console.log("TAAALLA");
    // check if user exists
    var query = {where: {username: username}};
    models.User.findOne(query).then(function(user) {
        if(!user) { // user doesn't exist
            return res.status(404).json({error:'UserNotFound'});
        }
        if(user.get('id') != userID) {
            res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
            return res.status(403).json({error: 'InvalidAccessrights'});
        }


        var query = {where: {id: blogpostid}}; 
        models.BlogPost.findOne(query).then(function(blogpost) { 
            if (!blogpost)
            {
                return res.status(404).json({error:'BlogPostNotFound'});
            }        
            blogpost.addLikers(user).then(function(){ 
                console.log("User "+user.get('id')+" liked blogpost "+ blogpost.id);
                console.log("Number of likes "+blogpost.get('likes'));
                /*
                numOfLikers = blogpost.getLikers().then(function(likers){ 
                    console.log( "LIKE "+likers.length )
                });
                

                blogpost.updateAttributes({
                    likes: blogpost.get('likes')+1
                }).then(function() {});
                return res.status(200).json({Success: 'LikeAdded'});*/
                 
                numOfLikers = blogpost.getLikers().then(function(likers){ 
                    console.log( "LIKE "+likers.length )
                    blogpost.updateAttributes({
                        likes: likers.length
                    }).then(function() {});
                return res.status(200).json({Success: 'LikeAdded'});
                });
            }, function(err) {
               return res.status(500).json({error: 'ServerError'});
            });     
        }, function(err)
        {
            return res.status(500).json({error: 'ServerError'});
        });


    }, function(err) {
         return res.status(500).json({error: 'ServerError'});   
    });
    
});
/*
                blogpost.getLikers().then(function(likers){ 
                    blogpost.updateAttributes({
                    likes: likers.length+1
                    }).then(function() {return res.status(200).json("Liker added");
                }); 
*/

// remove like
router.delete('/:username/likes/:id', requiredAuthentication,function(req, res, next) {

    console.log("MORJJEE");
    var username = req.params['username'];
    var blogpostid = req.params['id'];
    var userID = req.user.dataValues.id;
    //var namefield = req.body.name;
    //var password = req.body.password;
    //var id = req.user.dataValues.id;
     
    // check if user exists
    var query = {where: {username: username}};
    models.User.findOne(query).then(function(user) {
        if(!user) { // user doesn't exist
            return res.status(404).json({error:'UserNotFound'});
        }

        if(user.get('id') != userID) {
            res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
            return res.status(403).json({error: 'InvalidAccessrights'});
        }

        var query = {where: {id: blogpostid}}; 
        models.BlogPost.findOne(query).then(function(blogpost) { 
            if (!blogpost)
            {
                return res.status(404).json({error:'BlogNotFound'});
            }
            /*
            blogpost.getLikers().then(function(likers){ 
                    console.log( "LIKE 1 "+likers.length )
                });
            */
            blogpost.removeLikers([user]).then(function(){ 
                /*
                blogpost.getLikers().then(function(likers){ 
                    console.log( "LIKE 2 "+likers.length )
                });
                */
                blogpost.getLikers().then(function(likers){ 
                    console.log( "LIKE 2 "+likers.length )
                    console.log("User "+user.get('id')+" does not like anymore of blogpost "+ blogpost.id);
                    blogpost.updateAttributes({
                        likes: likers.length
                    }).then(function() {});
                    return res.status(200).json({Success: 'LikeRemoved'});
                });
            }, function(err) {
               return res.status(500).json({error: 'ServerError1'});
            });     
        }, function(err)
        {
            return res.status(500).json({error: 'ServerError2'});
        });


    }, function(err) {
         return res.status(500).json({error: 'ServerError3'});   
    });
    
});

router.put('/:username/follows/:id', requiredAuthentication, function(req, res, next) {
    var username = req.params['username'];
    var blogID = req.params['id'];
    
    // kirjautunut käyttäjä
    var userID = registered_user;
    
    // tarkista löytyykö nimellä käyttäjää
    models.User.findOne({where: {username: username}}).then(function(user) {
        if (!user) {
            return res.status(404).json({error: 'InvalidUsername'});
        }
        if(user.get('id') != userID) {
            res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
            return res.status(403).json({error: 'InvalidAccessrights'});
        }
        // tarkista löytyykö id:llä blogia
        models.Blog.findOne({where: {id: blogID}}).then(function(blog) {
            if(!blog) {
                return res.status(404).json({error: 'InvalidBlogId'});
            }
            // seuraaminen voidaan lisätä tässä
            blog.addFollower(user.get('id'));
            return res.status(200).json({Success: 'FollowerAdded'});
        }); 
            
    });
});

router.get('/:username/follows', function(req, res, next) {
    var username = req.params['username'];
    
    models.User.findOne({where: {username: username}}).then(function(user) {
        if (!user) {
            return res.status(404).json({error: 'InvalidUsername'});
        }
        user.getFollowedBlogs().then(function(follows) {
            for(var i = 0; i < follows.length; ++i) {
                follows[i] = follows[i].toJson();
                delete follows[i].BlogFollowers;
                delete follows[i].name;
            }
            return res.status(200).send(follows);
        });
    });
                                     
});

router.delete('/:username/follows/:id', requiredAuthentication, function(req, res, next) {
    var username = req.params['username'];
    var blogID = req.params['id'];
    
    // kirjautunut käyttäjä
    var userID = req.user.dataValues.id;
    
    // tarkista löytyykö nimellä käyttäjää
    models.User.findOne({where: {username: username}}).then(function(user) {
        if (!user) {
            return res.status(404).json({error: 'InvalidUsername'});
        }
        if(user.get('id') != userID) {
            res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
            return res.status(403).json({error: 'InvalidAccessrights'});
        }
        // tarkista löytyykö id:llä blogia
        models.Blog.findOne({where: {id: blogID}}).then(function(blog) {
            if(!blog) {
                return res.status(404).json({error: 'InvalidBlogId'});
            }
            // seuraaminen voidaan lopettaa tässä
            blog.removeFollower(user.get('id'));
            return res.status(200).json({Success: 'FollowerRemoved'});
        }); 
            
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

/*function requiredAuthentication(req, res, next) {
    //console.log("beginnin auth: ", req.user.id);
    if (req.user) {
        next();
    } else {
        passport.authenticate('basic', {session: false},
            function(err, user, info) {
                console.log("Autentikointi valmis? ");
                if (!user) {
                    res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
                    return res.status(401).json({error: 'Unauthorized'});
            })(req, res, next);
    }
};*/
function requiredAuthentication(req, res, next) {

    
    if (req.user) {
        registered_user = req.user;
        next();
    } else {
        basicAuth(req, res, next);
        registered_user = req.user.dataValues.id;
    }
}


module.exports = router;
