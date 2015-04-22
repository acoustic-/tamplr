var express = require('express');
var router = express.Router();
var passport = require('passport');

var models = require('../models');
var basicAuth = passport.authenticate('basic', {session: false});

var registered_user;

// create a blog
router.post('/', requiredAuthentication, function(req, res, next) {

    // tarkista onko req.user int-tyyppinen : jos ei niin luo arvo id
    if (req.user !== parseInt(req.user, 10)) {
        registered_user = req.user.dataValues.id;
    }

    console.log("beginning to add blog");
    var blogname = req.body.name;

    if (!blogname) {
        return res.status(400).json({error: 'InvalidBlogName'});
    }
    console.log("testi: ", req.user);
    models.Blog.create({
        name: blogname
    }).then(function(blog) {
        console.log("blog created");
        blog.addAuthor(registered_user);
        var blogID = '{"id": "' + blog.get('id') + '"}';
        var id = blog.get('id');
        return res.status(201).json(JSON.parse(blogID));
    },
            function(err) {
        return res.status(500).json({error: 'ServerError'});
    });
});


// create a blog post
router.post('/:id/posts', requiredAuthentication, function(req, res, next) {

    // tarkista onko req.user int-tyyppinen : jos ei niin luo arvo id
    if (req.user !== parseInt(req.user, 10)) {
        registered_user = req.user.dataValues.id;
    }

    var id = req.params['id'];
    var titleInput = req.body.title;
    var textInput = req.body.text;

    if ( !titleInput)
    {
        return res.status(400).json({error: 'MissingTitle'});
    } 
    if ( !textInput)
    {
        return res.status(400).json({error: 'MissingText'});
    }

    //userHaveAccess = false; //global parameter
    //id of the request user
    var userID = registered_user;
    console.log(userID);
    console.log(id);
    var query = {where: {id: id}};
    console.log("tullaan!!");
    models.Blog.findOne(query).then(function(blog) {
        console.log("jou1");
        if (blog) {
            console.log("jou2");
            blog.getAuthors().then(function(authors) {
                console.log(authors.length);
                var sent = false;
                for ( var i = 0; i < authors.length; ++i )
                {
                    console.log("jou4");
                    if ( authors[i].get('id') == userID ) //does user have access to this blog
                    {
                        console.log("moroo22");
                        //userHaveAccess = true;
                        //creata blog message
                        models.BlogPost.create({

                            title: titleInput,
                            text: textInput,
                            likes: 0,
                            author: authors[i].get('username')
                        }).then(function( blogpost ) 
                                {
                            blog.addPosts( blogpost );
                            blogpost.setAuthor( userID );
                            blogpost.setInBlog( id );
                            var blogpostID = '{"id": "' + blogpost.get('id') + '"}';
                            console.log("Blog writing done");
                            sent = true;

                            return res.status(201).json(JSON.parse(blogpostID));
                        },
                                function(err) 
                                {
                            return res.status(500).json({error: 'ServerError'});
                        });
                    } else {
                        if ( i == authors.length && authors[i].get('id') != userID && !sent) {
                            console.log("Unauthorized user",authors.length, authors[i].get('id'), userID, sent);
                            res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
                            return res.status(403).json({error: 'InvalidAccessrights'});

                        }
                    }
                }
            }, function(err) {
                return res.status(500).json({error: 'ServerError'});
            });
        } 
        else 
        {
            return res.status(404).json({error: 'BlogNotFound'});
        }
    },
                                    function(err) 
                                    {
        return res.status(500).json({error: 'ServerError'});
    });

    /*if (!userHaveAccess && res.statusCode != 404)
  {
      console.log("response: ", res.statusCode);
      return res.status(403).json({error: 'User does not have access to this blog'});
  }*/
});

/*
//Ei maaritelty speksissa mutta anyway
router.get('/:username', function(req, res, next) {
var username = req.params['username'];
models.User.findOne({where: {username: username}})
        .then(function(user){
            userId = user.id;
            if(!user) {
                console.log("usern: ", username);
                return res.status(404).json({error: 'UserNotFound'});
            }
            else
            {
                user.getAuthoredBlogs().then(function(blog) {
                    return res.status(200).json(blog)
                  });
            } 
    });
});
*/

// get blog's 10 blog writes
router.get('/:id/posts', function(req, res, next) {

    console.log("blogin tekstien haku");

    var id = req.params['id'];
    var query = {where: {id: id}};
    models.Blog.findOne(query).then(function(blog) {
        if (blog)
        {
            blog.getPosts().then(function(posts) {
                console.log("tassa");
                if (posts)
                {
                    var postArr = [];

                    var postMax = posts.length;
                    if( postMax > 10) {
                        postMax = 10;
                    }

                    for ( var i = 0; i < postMax; ++i )
                    {
                        var id = posts[i].get('id');
                        console.log(id);
                        var title = posts[i].get('title');
                        console.log(title);
                        var text = posts[i].get('text');
                        console.log(text);
                        //postArr.push("1");
                        //postArr.push( posts[i].toJson() );
                        //postArr.push( JSON.parse(JSON.stringify(posts[i])) );
                        console.log("perus: ", posts[i].toJson() );
                        //console.log("parse: ", JSON.parse(posts[i].toJson() ) );
                        postArr.push( posts[i].toJson() );
                    }
                    //var tulostus = JSON.stringify(postArr);
                    console.log("morjesta poytaa");
                    return res.status(200).send(postArr);
                }
                else
                {
                    return res.status(404).json({error: 'BlogPostNotFound'});
                }
            });
        }
        else
        {
            return res.status(404).json({error: 'BlogNotFound'});
        }
    });
});

// get blog
router.get('/:id', function(req, res, next) {


    var id = req.params['id'];
    // tsekataan onko syötetty käyttäjä nimi vai numero

    if (isNaN(id) ) {
        // kyseessä on username
        var username = id;
        var query = {where: { username: username}};
        models.User.findOne(query).then(function(user) {
            if (user) {
                user.getAuthoredBlogs().then(function(blogs){
                    return res.status(200).json(blogs[0].toJson() );
                });
            }
        });

    } 
    else {
        var query = {where: {id: id}};
        models.Blog.findOne(query).then(function(blog) {
            if (blog) {
                return res.status(200).json(blog.toJson());
            }
            else {
                return res.status(404).json({error: 'BlogNotFound'});
            }
        }, function(err) {
            return res.status(500).json({error: 'ServerError'});
        });  // blog.getAuthors()...});
    }
});









// delete blog
router.delete('/:id', requiredAuthentication, function(req, res, next) {

    // tarkista onko req.user int-tyyppinen : jos ei niin luo arvo id
    if (req.user !== parseInt(req.user, 10)) {
        registered_user = req.user.dataValues.id;
    }

    var refid = req.params['id'];
    var query = {where: {id:refid}};
    var regId = registered_user;

    var varBlog;

    models.Blog.findOne(query).then(function(blog) {
        if (blog) {
            /*if(blog.get('name') == "Default blog") {
                return res.status(403).json({error: 'DefaultBlog'});
            }*/
            blog.getAuthors().then(function(authors) {
                for(var i = 0; i < authors.length; ++i) {
                    if(authors[i].get('id') == regId) {

                        models.User.findOne({where: {id: regId}}).then(function(user) {
                            user.getAuthoredBlogs().then(function(authored){
                                if(authored[0].get('id') == refid) {
                                    return res.status(403).json({error: 'DefaultBlog'});
                                }
                            });
                        });
                        //blog.destroy().then(function(){console.log("blog removed")}, function(err) {"nope."});
                        varBlog = blog;
                        console.log("remove Authors");
                        return blog.setAuthors([]);
                    }
                    if ( i == authors.length -1 && authors[i].get('id') != regId) {
                        res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
                        return res.status(403).json({error: 'InvalidAccessrights'});
                    }
                }
            }, function(err) {
                return res.status(500).json({error: 'ServerError'});
            });  // blog.getAuthors()...


            //no error function callbacks needed here 
            blog.setFollowers([]).then(function() {  
                //success
                blog.setPosts([]).then(function() { 
                    //success
                    blog.destroy().then(function() {
                        //success
                        return res.status(200).json({success: "Blog destroyed"}) })
                });
            }); // blog.setFollowers([])...




        } //if (blog)
        else {
            return res.status(404).json({error: 'BlogNotFound'});
        }
    }, function (err) { // models.Blog.findOne(query).the... error function callback
        return res.status(500).json({error: 'ServerError'});
    });
    /*}).then(function(varBlog) {
        console.log("remove Followers", varBlog);
        varBlog.setFollowers([]).then(function() {;
    }).then(function(varBlog) {
        console.log("remove blog", varBlog);
        varBlog.destroy();
    }).then(function(blog){
        return res.json({Success: 'Done'});
        console.log("done?");
    });*/
    // joko blogi on poistettu tai ei
    /*models.Blog.findOne(query).then(function(blog) {
        if (blog) {
            // käyttäjällä ei ollu oikeuksia blogin poistoon
            res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
            return res.status(403).json({error: 'InvalidAccessrights'});
        }  
    });*/
});

router.get('/:id/authors', requiredAuthentication, function(req, res, next) {
    var blogID = req.params['id'];

    models.Blog.findOne({where: {id: blogID}}).then(function(blog) {
        blog.getAuthors().then(function(authors) {
            return res.status(200).json(authors);
        } , function(err) {
            return res.status(500).json({error: 'ServerError'});
        });
    });
});


// lisää kirjoitusoikeus blogiin
router.put('/:id/author/:username', requiredAuthentication, function(req, res, next) {

    // tarkista onko req.user int-tyyppinen : jos ei niin luo arvo id
    if (req.user !== parseInt(req.user, 10)) {
        registered_user = req.user.dataValues.id;
    }

    // parameters of the reguest
    var id = req.params['id'];
    var username = req.params['username'];
    var userId = 0;

    // name of the registered user

    models.User.findOne({where: {username: username}})
        .then(function(user){
        userId = user.id;
        if(!user) {
            console.log("usern: ", username);
            return res.status(404).json({error: 'UserNotFound'});
        }

        user.getAuthoredBlogs().then(function(authored){
            if(authored[0].get('id') == id) {
                return res.status(403).json({error: 'DefaultBlog'});
            }
        });
    });

    models.Blog.findOne({where: {id: id}}).then(function(blog) {
        // if blog was not found
        if(!blog) {
            return res.status(404).json({error: 'BlogNotFound'});
        }
        // 403 if blog is default blog
        //if(blog.get('name') == "Default blog") {
        //    return res.status(403).json({error: 'DefaultBlog'});
        //} else {
        blog.getAuthors().then(function(authors){
            // find is registered user has rights to the given blog

            for(var i = 0; i < authors.length; ++i) {
                console.log(authors[i].id);
                if(authors[i].id == registered_user) {
                    blog.addAuthor(userId).then(function(){console.log("onnistui")}, function(err) {console.log("epäonnistui")});
                    return res.status(200).json({Success: 'AuthorAdded'});
                }
                if(i == authors.length -1 && authors[i].id != registered_user) {
                    console.log("user had no rights");
                    res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
                    return res.status(403).json({error: 'InvalidAccessrights'});
                }
            }

        }, function(err) {
            return res.status(500).json({error: 'ServerError'});
        });
        //}
    }, function(err) {
        return res.status(500).json({error: 'ServerError'});
    });     
});

// poista kirjoistusoikeus
router.delete('/:id/author/:username', requiredAuthentication, function(req, res, next) {

    // tarkista onko req.user int-tyyppinen : jos ei niin luo arvo id
    if (req.user !== parseInt(req.user, 10)) {
        registered_user = req.user.dataValues.id;
    }

    console.log("begin delete author");
    // parameters of the reguest
    var id = req.params['id'];
    var username = req.params['username'];

    var userId = 0;
    // name of the registered user

    models.User.findOne({where: {username: username}})
        .then(function(user){
        console.log("testi11");
        console.log("user.id : ", user.id);
        // find user of the request; in 'user'
        userId = user.id;
        user.getAuthoredBlogs().then(function(authored){
            console.log("AUTHORED: ", authored[0].get('id'),id);
            if(user.get(defaultBlog) == id) {
                return res.status(403).json({error: 'DefaultBlog'});
            }
        });
        console.log("onnistuiko?");

    })
        .catch(function(err) {
        console.log("usern: ", username);
        return res.status(404).json({error: 'UserNotFound'});
    });
    //user.getAuthoredBlogs().then(function(blogs) {
    console.log("päästäänkö tänne?");
    models.Blog.findOne({where: {id: id}}).then(function(blog) {
        // 403 if blog is default blog

        /*if(blog.get('name') == "Default blog") {
            return res.status(403).json({error: 'DefaultBlog'});
        }*/

        console.log("testiä");
        blog.getAuthors().then(function(authors){
            // find is registered user has rights to the given blog
            console.log("lisää tekstiä");
            for(var i = 0; i < authors.length; ++i) {
                console.log(authors[i].id);
                if(authors[i].id== registered_user) {
                    //console.log("blog ulos");
                    //console.log(blog);
                    // user is has author right so request can be fulfilled

                    //remove blog author

                    blog.removeAuthor(userId); // user-field?
                    return res.status(200).json({Success: 'AuthorRemoved'});

                }
                if(i == authors.length -1 && authors[i].id != registered_user) {
                    console.log("user had no rights");
                    res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
                    return res.status(403).json({error: 'InvalidAccessrights'});
                }
            }; 
        });
    })
        .catch(function(err) {
        return res.status(404).json({error: 'BlogNotFound'});
    });                                 
});


//lisää kirjoitusoikeus

/*router.put('/:id/author/:username', function(req, res, next) {
    var username = req.params['username'];
    var id = req.params['id'];
    var regId = registered_user;

    models.Blog.findOne({where: {id: id}})
    .then(function(blog) {
//        /* if(!blog) { // user doesn't exist
//            return res.status(404).json({error:'BlogNotFound'});
//        } else {
//            models.User.find({where: {username:username}}).then(function(user) {
//                if(!user) {
//                    return res.status(404).json({error: 'UserNotFound'});
//                }
//                /*blog.getAuthors().then(function(authors) {
//                    for( var i = 0; i < authors.length; ++i) {
//                        if(regId == authors[i].get('id')) {
//                            // kirjautuneella käyttäjällä on kirjoitusoikeus blogiin
//                            // voidaan lisätä kirjoitusoikeus
//
//                            //tarkista vielä onko kyseessä oletusblogi
//                            if(blog.get('name') == "Default blog") {
//                                return res.status(403).json({error: 'DefaultBlog'});
//                            }
//                            //lisää kirjoitusoikeus
//                            blog.addAuthor(user.get('id'));
//                            return res.status(200);
//                        }
//                    }
//                });
//                blog.addAuthor(user.get('id')).then(function() {console.log("lisätty."), function(err) {consolo.log("noup")}});
//                return res.status(200);
//            });
//        }*/
/*        console.log("blog found.", blog);      
    }, function(err) {
        return res.status(500).json({error: 'ServerError'});
    });
});*/

//hae blogin seuraajat
router.get('/:id/followers', function(req, res, next) {
    var id = req.params['id'];

    models.Blog.findOne({where: {id: id}}).then(function(blog) {
        if (!blog) {
            return res.status(404).json({error: 'BlogNotFound'});
        }
        blog.getFollowers().then(function(followers) {

            for(var i = 0; i < followers.length; ++i) {
                console.log("follower1: ", followers[i]);
                // follows[i] = follows[i].toJson();
                followers[i] = followers[i].toJSON();
                //followers[i] = json.parse(followers[i]);
                console.log("follower2: ", followers[i]);
                delete followers[i].BlogFollowers;
                delete followers[i].name;
            }
            return res.status(200).send(followers);
        });
    });
});


// hae kaikki blogin postaukset
// get blog's 10 blog writes
router.get('/:id/posts/all', function(req, res, next) {


    var id = req.params['id'];
    var query = {where: {id: id}};
    models.Blog.findOne(query).then(function(blog) {
        if (blog)
        {
            blog.getPosts().then(function(posts) {
 
                if (posts)
                {
                    return res.status(200).send(posts);
                }
                else
                {
                    return res.status(404).json({error: 'BlogPostNotFound'});
                }
            });
        }
        else
        {
            return res.status(404).json({error: 'BlogNotFound'});
        }
    });
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