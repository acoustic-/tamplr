var express = require('express');
var router = express.Router();
var passport = require('passport');

var models = require('../models');
var basicAuth = passport.authenticate('basic', {session: false});

// create a blog
router.post('/', requiredAuthentication, function(req, res, next) {

    
  var blogname = req.body.name;
    
  if (!blogname) {
    return res.status(400).json({error: 'InvalidBlogName'});
  }
    console.log("testi: ", req.user.dataValues.id);
  models.Blog.create({
    name: blogname
  }).then(function(blog) {
    blog.addAuthor(req.user.dataValues.id);
    return res.status(201).json({id: blog.id});
  },
  function(err) {
    return res.status(500).json({error: 'ServerError'});
  });
});


// create a blog message
router.post('/:id/posts', requiredAuthentication, function(req, res, next) {
  

  var id = req.params['id'];
  var titleInput = req.body.title;
  var textInput = req.body.text;
  userHaveAccess = 123123; //global parameter
  //id of the request user
  var userID = req.user.dataValues.id;

  var query = {where: {id: id}};
  console.log("tullaan!!");
  models.Blog.findOne(query).then(function(blog) {
    console.log("jou1");
  if (blog) {
    blog.getAuthors().then(function(authors) {
          for ( var i = 0; i < authors.length; ++i )
          {
              
              if ( authors[i].get('id') == userID ) //does user have access to this blog
              {
                console.log("moroo22");
                userHaveAccess = 0;
                //creata blog message
                models.BlogPost.create({

                title: titleInput,
                text: textInput,
                author: authors[i].get('username')
                }).then(function( blogpost ) 
                {
                    blog.addPosts( blogpost );
                    blogpost.setAuthor( userID );
                    blogpost.setInBlog( id );
                    console.log("Blog writing done");
                    return res.status(200).json();
                }),
                function(err) 
                {
                    return res.status(500).json({error: 'ServerError'});
                };
              }
          }
        });
    }
  });
  if (userHaveAccess != 123123 )
  {
      return res.status(403).json({error: 'User does not have access to this blog'});
  }

});








// get blogs writes
router.get('/:id/posts', function(req, res, next) {
 
  console.log("blogin tekstien haku");

  var id = req.params['id'];
  var query = {where: {id: id}};
  models.Blog.findOne(query).then(function(blog) {

      blog.getPosts().then(function(posts) {
        console.log("tassa");
        if (posts)
        {
          var postArr = [];
          for ( var i = 0; i < posts.length; ++i )
          {
                  var id = posts[i].get('id');
                  console.log(id);
                  var title = posts[i].get('title');
                  console.log(title);
                  var text = posts[i].get('text');
                  console.log(text);
                  //postArr.push("1");
                  postArr.push( posts[i].toJson() );
          }

          return res.status(200).json(postArr,null,3 );

        }
        else
        {
          return res.status(404).json({error: 'BlogPostNotFound'});
        }

      });
  });
});

/*
    if (blog) {
      return res.json(blog.toJson());
    }
    else {
      return res.status(404).json({error: 'BlogNotFound'});
    }
  });
});
*/

// post 
router.get('/:id', requiredAuthentication, function(req, res, next) {
 
  var id = req.params['id'];
  var query = {where: {id: id}};
  models.Blog.findOne(query).then(function(blog) {
    if (blog) {
      return res.json(blog.toJson());
    }
    else {
      return res.status(404).json({error: 'BlogNotFound'});
    }
  });
});











router.delete('/:id', requiredAuthentication, function(req, res, next) {
    var id = req.params['id'];
    var query = {where: {id:id}};
    var regId = req.user.dataValues.id;
    models.Blog.findOne(query).then(function(blog) {
        if (blog) {
            if(blog.get('name') == "Default blog") {
                return res.status(403).json({error: 'DefaultBlog'});
            }
            blog.getAuthors().then(function(authors) {
                for(var i = 0; i < authors.length; ++i) {
                    if(authors[i].get('id') == regId) {
                        console.log("defined user found");
                        //models.Blog.destroy(query).then(function() {console.log("blog deleted")});
                        blog.destroy().then(function() {console.log("blog deleted")});
                    }
                }
            });
        }
        if (!blog) {
            return res.status(404).json({error: 'BlogNotFound'});
        }
    });
    // joko blogi on poistettu tai ei
    models.Blog.findOne(query).then(function(blog) {
        if (blog) {
            // käyttäjällä ei ollu oikeuksia blogin poistoon
            res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
            return res.status(403).json({error: 'InvalidAccessrights'});
        }  
    });
});


             
    

router.put('/:id/author/:username', requiredAuthentication, function(req, res, next) {
    // parameters of the reguest
    var id = req.params['id'];
    var username = req.params['username'];
    
    var userId = 0;
    // name of the registered user
    console.log("req user : ", req.user.dataValues.username);
    models.User.findOne({where: {username: username}})
        .then(function(user){
            console.log("testi11");
            console.log("user.id : ", user.id);
            // find user of the request; in 'user'
            userId = user.id;
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
        
        if(blog.get('name') == "Default blog") {
            return res.status(403).json({error: 'DefaultBlog'});
        }
        
        console.log("testiä");
        blog.getAuthors().then(function(authors){
            // find is registered user has rights to the given blog
            console.log("lisää tekstiä");
           for(var i = 0; i < authors.length; ++i) {
               console.log(authors[i].id);
               if(authors[i].username == req.user.dataValues.username) {
                    //console.log("blog ulos");
                    //console.log(blog);
                   // user is has author right so request can be fulfilled
                    blog.addAuthor(userId);
                    return res.status(200);
               }
            }; 
        });
        // TODO soemwhere should 403, not rights
    })
    .catch(function(err) {
        return res.status(404).json({error: 'BlogNotFound'});
    });                                 
});

// pretty much same as the previous one
router.delete('/:id/author/:username', requiredAuthentication, function(req, res, next) {
    // parameters of the reguest
    var id = req.params['id'];
    var username = req.params['username'];
    
    var userId = 0;
    // name of the registered user
    console.log("req user : ", req.user.dataValues.username);
    models.User.findOne({where: {username: username}})
        .then(function(user){
            console.log("testi11");
            console.log("user.id : ", user.id);
            // find user of the request; in 'user'
            userId = user.id;
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
        
        if(blog.get('name') == "Default blog") {
            return res.status(403).json({error: 'DefaultBlog'});
        }
        
        console.log("testiä");
        blog.getAuthors().then(function(authors){
            // find is registered user has rights to the given blog
            console.log("lisää tekstiä");
           for(var i = 0; i < authors.length; ++i) {
               console.log(authors[i].id);
               if(authors[i].username == req.user.dataValues.username) {
                    //console.log("blog ulos");
                    //console.log(blog);
                   // user is has author right so request can be fulfilled
                    blog.removeAuthor(userId); // user-field?
                    return res.status(200);
               }
            }; 
        });
        // TODO soemwhere should 403, not rights
    })
    .catch(function(err) {
        return res.status(404).json({error: 'BlogNotFound'});
    });                                 
});
            
function requiredAuthentication(req, res, next) {

    
    if (req.user) {
        next();
    } else {
        basicAuth(req, res, next);
    }
}

module.exports = router;