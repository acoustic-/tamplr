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
  

  var id = req.params['id'];
  var titleInput = req.body.title;
  var textInput = req.body.text;

  if ( titleInput == "" || textInput == "" )
  {
    return res.status(400).json({error: 'Missing title or text'});
  }

  userHaveAccess = 123123; //global parameter
  //id of the request user
  var userID = req.user.dataValues.id;
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
          for ( var i = 0; i < authors.length; ++i )
          {
              console.log("jou4");
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
                    var blogpostID = '{"id": "' + blogpost.get('id') + '"}';
                    console.log("Blog writing done");
                    return res.status(200).json(JSON.parse(blogpostID));
                },
                function(err) 
                {
                    return res.status(500).json({error: 'ServerError'});
                });
              }
          }
        },
        function(err) 
        {
          return res.status(500).json({error: 'ServerError'});
        });
    }
  },
  function(err) 
  {
    return res.status(500).json({error: 'ServerError'});
  });
  if (userHaveAccess != 123123 )
  {
      return res.status(403).json({error: 'User does not have access to this blog'});
  }

});








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
            for ( var i = 0; i < posts.length; ++i )
            {
                    var id = posts[i].get('id');
                    console.log(id);
                    var title = posts[i].get('title');
                    console.log(title);
                    var text = posts[i].get('text');
                    console.log(text);
                    //postArr.push("1");
                    //postArr.push( posts[i].toJson() );
                    postArr.push( JSON.parse(JSON.stringify(posts[i])) );
            }
            //var tulostus = JSON.stringify(postArr);
            console.log("morjesta poytaa");
            return res.status(200).json(postArr,null,'\t' );
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









// delete blog

router.delete('/:id', requiredAuthentication, function(req, res, next) {
    var refid = req.params['id'];
    var query = {where: {id:refid}};
    var regId = req.user.dataValues.id;
    models.Blog.findOne(query).then(function(blog) {
        
        if (blog) {
            if(blog.get('name') == "Default blog") {
                return res.status(403).json({error: 'DefaultBlog'});
            }
            
            
        
            blog.getAuthors().then(function(authors) {
                for(var i = 0; i < authors.length; ++i) {
                    if(authors[i].get('id') == regId) {
                        //blog.setPosts([]);
                        //task.destroy().then(function() {
                        //blog.setAuthors([]);
                        blog.destroy().then(function(){console.log("blog removed")}, function(err) {"nope."});
                        return res.status(200).json({Success: 'BlogRemoved'});
                    }
                    if ( i = authors.length -1 && authors[i].get('id') != regId) {
                        res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
                        return res.status(403).json({error: 'InvalidAccessrights'});
                    }
                }
            }, function(err) {
                return res.status(500).json({error: 'ServerError'});
            });
           
            
        }
        if (!blog) {
            return res.status(404).json({error: 'BlogNotFound'});
        }
    }, function (err) {
        return res.status(500).json({error: 'ServerError'});
    });
    // joko blogi on poistettu tai ei
    /*models.Blog.findOne(query).then(function(blog) {
        if (blog) {
            // käyttäjällä ei ollu oikeuksia blogin poistoon
            res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
            return res.status(403).json({error: 'InvalidAccessrights'});
        }  
    });*/
});


             
    
// lisää kirjoitusoikeus blogiin
router.put('/:id/author/:username', requiredAuthentication, function(req, res, next) {
    // parameters of the reguest
    var id = req.params['id'];
    var username = req.params['username'];
    var userId = 0;
    
    // name of the registered user
    console.log("req user : ", req.user.dataValues.username);
    
    models.User.findOne({where: {username: username}})
        .then(function(user){
            userId = user.id;
            if(!user) {
                console.log("usern: ", username);
                return res.status(404).json({error: 'UserNotFound'});
            }
    });
    
    models.Blog.findOne({where: {id: id}}).then(function(blog) {
        // if blog was not found
        if(!blog) {
            return res.status(404).json({error: 'BlogNotFound'});
        }
         // 403 if blog is default blog
        if(blog.get('name') == "Default blog") {
            return res.status(403).json({error: 'DefaultBlog'});
        } else {
            blog.getAuthors().then(function(authors){
            // find is registered user has rights to the given blog
          
                for(var i = 0; i < authors.length; ++i) {
                    console.log(authors[i].id);
                    if(authors[i].username == req.user.dataValues.username) {
                        blog.addAuthor(userId).then(function(){console.log("onnistui")}, function(err) {console.log("epäonnistui")});
                        return res.status(200).json({Success: 'AuthorAdded'});
                    }
                    if(i == authors.length -1 && authors[i].username != req.user.dataValues.username) {
                        console.log("user had no rights");
                        res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
                        return res.status(403).json({error: 'InvalidAccessrights'});
                    }
                }
                 
            }, function(err) {
                return res.status(500).json({error: 'ServerError'});
            });
        }
    }, function(err) {
        return res.status(500).json({error: 'ServerError'});
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
                   
                   //remove blog author
                    
                    blog.removeAuthor(userId); // user-field?
                    return res.status(200).json({Success: 'AuthorRemoved'});
                   
               }
               if(i == authors.length -1 && authors[i].username != req.user.dataValues.username) {
                        console.log("user had no rights");
                        res.setHeader('WWW-Authenticate', 'Basic realm="tamplr"');
                        return res.status(403).json({error: 'InvalidAccessrights'});
                }
            }; 
        });
        // TODO soemwhere should 403, not rights
    })
    .catch(function(err) {
        return res.status(404).json({error: 'BlogNotFound'});
    });                                 
});


//lisää kirjoitusoikeus

/*router.put('/:id/author/:username', function(req, res, next) {
    var username = req.params['username'];
    var id = req.params['id'];
    var regId = req.user.dataValues.id;
    
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

            
function requiredAuthentication(req, res, next) {

    
    if (req.user) {
        next();
    } else {
        basicAuth(req, res, next);
    }
}

module.exports = router;