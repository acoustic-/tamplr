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

  //id of the request user
  var  userID = req.user.dataValues.id;

  var query = {where: {id: id}};
  models.Blog.findOne(query).then(function(blog) 
  {
    if (blog) 
    {
        blog.getAuthors().then(function(authors)
        {
          for ( var i = 0; i < authors.length(); ++i )
          {
              if ( authors[i].get('id') == userID ) //does user have access to this blog
              {
                //creata blog message
                models.BlogPost.create({
                title: titleInput,
                text: textInput,
                author: authors[i].get('username')
                }).then(function(user) 
                {
                    console.log("Blog writing done");
                    return res.status(200);
                }),
                function(err) 
                {
                    return res.status(500).json({error: 'ServerError'});
                };
              }
          }
          return res.status(403).json({error: 'User does not have access to this blog'});
        });
    }
    else 
    {
      return res.status(404).json({error: 'BlogNotFound'});
    }
  });
});







/*
// blog's 10 writings
router.get('/:id/posts', function(req, res, next) {
 
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
    models.Blog.findOne(query).then(function(blog) {
        if (blog) {
            models.Blog.destroy(query);
        }
        if (!blog) {
            return res.status(404).json({error: 'BlogNotFound'});
        }
    });
});


             
    

router.put('/:id/author/:username', requiredAuthentication, function(req, res, next) {
    var id = req.params['id'];
    var username = req.params['username'];
    
    var userId = 0;
    console.log("req user : ", req.user.dataValues.username);
    models.User.findOne({where: {username: username}})
        .then(function(user){
            console.log("testi11");
            console.log("user.id : ", user.id);
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
        console.log("testiä");
        blog.getAuthors().then(function(authors){
            console.log("lisää tekstiä");
           for(var i = 0; i < authors.length; ++i) {
               console.log(authors[i].id);
               if(authors[i].username == req.user.dataValues.username) {
                    //console.log("blog ulos");
                    //console.log(blog);
                    blog.addAuthor(userId);
                    return res.status(200);
               }
            }; 
        });
    
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