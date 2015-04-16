var express = require('express');
var router = express.Router();
var passport = require('passport');

var models = require('../models');
var basicAuth = passport.authenticate('basic', {session: false});

router.get('/:id', function(req, res, next) {
    var id = req.params['id'];
    var query = {where: {id: id}};


    console.log("registered_user: ", req.user);
    /*
    models.Blog.findOne(query).then(function(blog) {
        var blogposts = [];
        blog.getPosts().then(function(posts) {

            for (var i = 0; posts.length; ++i) {
                var post = posts[i];
                var post_obj = posts[i];
                var text = posts[i].text;
                var title = posts[i].title;
                var likes = 100;
                var comments = 1000;
                console.log("posts: ", posts[i]);
                console.log("posts i: ", posts[i].title );
                console.log("txt i: ", text, "   ", i );
                //console.log("post name: ", posts[i].dataValues['text']);
            }
            for (var i = 0; posts.length; ++i) {
                posts[i].getLikers().then(function(likers) {
                    console.log(i, " likers: ", likers.length);
                    likes = likers.length;
                });
            }

            post.getComments().then(function(comments) {
                var comments = comments.length;
                likes = likers.length;

            });
            console.log(i,"sisään menossa: ", title, text, likes, comments);
            blogposts.push({ title: title,
                            text: text,
                            likes: likes,
                            comments: comments
                           });
            console.log("blogpost:     ", blogposts);
        });*/

    models.Blog.findOne(query).then(function(blog) {
        var postinfo = [];
        blog.getPosts().then(function(posts) {
            // jos blogissa ei ole postauksia
            if (posts.length == 0) {
                var now = new Date();
                var jsonDate = now.toJSON();
                postinfo.push({title: "Blogissa ei ole..", text: ".. vielä yhtään postausta.",
                               likes: 0, comments: 0, author: "admin", 
                               created:jsonDate});
                if(!req.user) {// if user isn't logged in
                    console.log("length: ", postinfo.length);
                    console.log("user isn't logged in -> render");
                    res.render('blog_unloggedin', {
                        posts: postinfo,
                        name:  blog.get('name')
                    });
                } else {
                    models.User.findOne({where: {id: req.user}}).then(function(user) {
                        console.log("user is logger in -> render");
                        var rendered = false;
                        blog.getAuthors().then(function(authors) {
                            for(var i = 0; i< authors.length; ++i) {
                                if (authors[i].get('id') == req.user) {
                                    console.log("author found");
                                    rendered = true;
                                    res.render('blog_for_author', {
                                        posts: postinfo,
                                        name:  blog.get('name'),
                                        user: user,
                                        blogID: blog.get('id')
                                    });
                                }
                                if(!rendered && i == authors.length-1 
                                   && authors[i].get('id') != req.user) {
                                    res.render('blog', {
                                        posts: postinfo,
                                        name:  blog.get('name'),
                                        user: user,
                                        blogID: blog.get('id')
                                    });
                                }
                            }
                        });
                    });
                }
            }

            // jos blogissa on postauksia
            for(var i = 0; i < posts.length; ++i) {
                //console.log("posts: ", posts);
                var post = posts[i];
                var text = posts[i].text;
                var title = posts[i].title;
                var authorID = posts[i].author;
                var created = posts[i].createdAt;

                post.getLikers().then(function(likers) {
                    post.getComments().then(function(comments) {

                        postinfo.push({title: title, text: text, likes: likers.length, 
                                       comments: comments.length, author: authorID, created: created});
                        console.log("postinfo: ", postinfo);

                        if(postinfo.length == posts.length) {

                            console.log("!postinfo: ", postinfo);
                            if(!req.user) {// if user isn't logged in
                                console.log("length: ", postinfo.length);
                                console.log("user isn't logged in -> render");
                                res.render('blog_unloggedin', {
                                    posts: postinfo,
                                    name:  blog.get('name')
                                });

                            } else {
                                models.User.findOne({where: {id: req.user}}).then(function(user) {
                                    console.log("user is logger in -> render");
                                    var rendered = false;

                                    blog.getAuthors().then(function(authors) {
                                        for(var i = 0; i< authors.length; ++i) {
                                            if (authors[i].get('id') == req.user) {
                                                console.log("author found");
                                                rendered = true;
                                                res.render('blog_for_author', {
                                                    posts: postinfo,
                                                    name:  blog.get('name'),
                                                    user: user,
                                                    blogID: blog.get('id')
                                                });
                                            }
                                            if(!rendered && i == authors.length-1 
                                               && authors[i].get('id') != req.user) {
                                                res.render('blog', {
                                                    posts: postinfo,
                                                    name:  blog.get('name'),
                                                    user: user,
                                                    blogID: blog.get('id')
                                                });
                                            }
                                        }
                                    });
                                });
                            }
                        };

                    });

                });
            };
        });


        console.log("postinfo_: ", postinfo);




    });
});


    /*                             

            for(var i = 0; i < posts.length; i++) {
                var post = posts[i];
                post.getLikers().then(function(likers) {
                    post.getComments().then(function(comments) {
                        blogposts.push({name: post.get('name'),
                                        text: post.get('text'),
                                        likes: likers.length,
                                        comments: comments.length
                                       });
                       console.log("i: ", i, posts.length);
                        if(i == posts.length -1 ) { // silmukka suoritettu loppuun

                            console.log("len: ", blogposts.length);
                            console.log("posts: ", blogposts);

                            if(!req.user) {// if user isn't logged in
                                console.log("user isn't logged in -> render");
                                res.render('blog_unloggedin', {
                                    posts: blogposts,
                                    name:  blog.get('name')
                                });
                            } else {
                                console.log("user is logger in -> render");
                                var rendered = false;
                                blog.getAuthors().then(function(authors) {
                                    for(var i = 0; i< authors.length; ++i) {
                                        if (authors.get('id') == req.user) {
                                            rendered = true;
                                            res.render('blog_for_author', {
                                                posts: blogposts,
                                                name:  blog.get('name')
                                            });
                                        }
                                        if(!rendered && i == authors.length-1 
                                           && authors.get('id') != req.user) {
                                            res.render('blog', {
                                                posts: blogposts,
                                                name:  blog.get('name')
                                            });
                                        }
                                    }
                                });
                            }

                        }


                    });
                });
            }
        });
    });
});
*/


    /*
res.render('index', {
                                host: req.headers.host,
                                user: user,
                                follows: follows,
                                authored: authored,
                                blogs: blogs,
                                posts: postsArr
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
*/



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