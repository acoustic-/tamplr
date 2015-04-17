var express = require('express');
var router = express.Router();
var passport = require('passport');

var models = require('../models');
var basicAuth = passport.authenticate('basic', {session: false});

router.get('/:id', function(req, res, next) {
    var id = req.params['id'];
    var query = {where: {id: id}};


    console.log("registered_user: ", req.user);

    models.Blog.findOne(query).then(function(blog) {
        blog.getPosts().then(function(posts) {
            var commentsArr = [];
            //------------ jos blogissa ei ole postauksia
            if (posts.length == 0) {
                var now = new Date();
                var jsonDate = now.toJSON();
                var nposts = [{title: "Blogissa ei ole..", text: ".. vielä yhtään postausta.",
                               likes: 0, comments: 0, author: "admin", 
                               created:jsonDate}];
                commentsArr.push(0);
                if(!req.user) {// if user isn't logged in
                    console.log("user isn't logged in -> render");
                    res.render('blog_unloggedin', {
                        posts: nposts,
                        name:  blog.get('name'),
                        comments: commentsArr
                    });
                } else {
                    models.User.findOne({where: {id: req.user}}).then(function(user) {
                        blog.getAuthors().then(function(authors) {
                            console.log("--commentsArr: ", commentsArr);
                            for(var i = 0; i< authors.length; ++i) {
                                if (authors[i].get('id') == req.user) {
                                    console.log("author found");
                                    rendered = true;
                                    res.render('blog_for_author', {
                                        posts: nposts,
                                        name:  blog.get('name'),
                                        user: user,
                                        blogID: blog.get('id'),
                                        comments: commentsArr
                                    });
                                }
                                if(!rendered && i == authors.length-1 
                                   && authors[i].get('id') != req.user) {
                                    res.render('blog', {
                                        posts: nposts,
                                        name:  blog.get('name'),
                                        user: user,
                                        blogID: blog.get('id'),
                                        comments: commentsArr
                                    });
                                }
                            }
                        });

                    });

                }
            } else {

                if(!req.user) {// if user isn't logged in

                    var anotherArr = [];
                    function printToComments(element, index, array){

                        posts[index].getComments().then(function(comments) {
                            return comments.length;
                        }) .then(function(long) {
                            commentsArr.push(long);
                            return commentsArr;
                        }) .then(function(commentsArr) {
                            if( posts.length-1 == index) {

                                console.log("user isn't logged in -> render");
                                res.render('blog_unloggedin', {
                                    posts: posts,
                                    name:  blog.get('name'),
                                    comments: commentsArr
                                });
                            }
                        });
                    };

                    console.log("redy comm: ", commentsArr);
                    console.log("redy comm: ", anotherArr);

                    posts.forEach(printToComments);

                } else {
                    models.User.findOne({where: {id: req.user}}).then(function(user) {

                        function printToComments(element, index, array){

                            posts[index].getComments().then(function(comments) {
                                return comments.length;
                            }) .then(function(long) {
                                commentsArr.push(long);
                                return commentsArr;
                            });
                            console.log("!comm: ", commentsArr);
                        };

                        console.log("redy comm: ", commentsArr);

                        posts.forEach(printToComments);

                        console.log("user is logger in -> render");
                        var rendered = false;
                        blog.getAuthors().then(function(authors) {
                            console.log("--commentsArr: ", commentsArr);
                            for(var i = 0; i< authors.length; ++i) {
                                if (authors[i].get('id') == req.user) {
                                    console.log("author found");
                                    rendered = true;
                                    res.render('blog_for_author', {
                                        posts: posts,
                                        name:  blog.get('name'),
                                        user: user,
                                        blogID: blog.get('id'),
                                        comments: commentsArr
                                    });
                                }
                                if(!rendered && i == authors.length-1 
                                   && authors[i].get('id') != req.user) {
                                    res.render('blog', {
                                        posts: posts,
                                        name:  blog.get('name'),
                                        user: user,
                                        blogID: blog.get('id'),
                                        comments: commentsArr
                                    });
                                }
                            }
                        });
                    });
                }
            }
        });
    });
});

router.get('/:blogid/post/:postid', function(req, res, next){
    var blogid = req.params['blogid'];
    var postid = req.params['postid'];

    models.Blog.findOne({where: {id: blogid}}).then(function(blog){
        console.log("found blog");
        blog.getPosts().then(function(posts) {
            console.log("found postst?", posts)
            for(var i = 0; i < posts.length; ++i) {
                if(posts[i].get('id') == postid) {
                    models.BlogPost.findOne({where: {id: postid}}).then(function(post) {
                        console.log("post: ", post);
                        if (req.user) {
                            models.User.findOne({where: {id: req.user}}).then(function(user){
                                post.getComments().then(function(comments) {   
                                    // käyttäjä on kirjautunut sisään
                                    res.render('post', {
                                        post: post,
                                        name: blog.get('name'),
                                        blogID: blog.get('id'),
                                        comments: comments,
                                        user: user
                                    });
                                });
                            });

                        } else {
                            posts[i].getComments().then(function(comments) {   
                                // käyttäjä on kirjautunut sisään
                                res.render('post_unloggedin', {
                                    post: posts[i],
                                    name: blog.get('name'),
                                    blogID: blog.get('id'),
                                    comments: comments
                                });
                            });

                        }
                    });
                }
            }
        });
    });
});

/*router.get('/:id', function(req, res, next) {
    var id = req.params['id'];
    var query = {where: {id: id}};


    console.log("registered_user: ", req.user);

    models.Blog.findOne(query).then(function(blog) {
        blog.getPosts().then(function(posts) {

            //------------ jos blogissa ei ole postauksia
            if (posts.length == 0) {
                var now = new Date();
                var jsonDate = now.toJSON();
                posts = {title: "Blogissa ei ole..", text: ".. vielä yhtään postausta.",
                         likes: 0, comments: 0, author: "admin", 
                         created:jsonDate};
            }

            var commentsArr = [];
            for(var i = 0; i < posts.length; ++i) {
                posts[i].getComments().then(function(comments){
                    commentsArr.push(comments);
                    return commentsArr;
                }) .then(function() {
                    console.log("commentsArr: ", commentsArr);

                });
            }
            console.log("commentsArr: ", commentsArr);

            if(!req.user) {// if user isn't logged in

                console.log("user isn't logged in -> render");
                res.render('blog_unloggedin', {
                    posts: posts,
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
                                    posts: posts,
                                    name:  blog.get('name'),
                                    user: user,
                                    blogID: blog.get('id')
                                });
                            }
                            if(!rendered && i == authors.length-1 
                               && authors[i].get('id') != req.user) {
                                res.render('blog', {
                                    posts: posts,
                                    name:  blog.get('name'),
                                    user: user,
                                    blogID: blog.get('id')
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