var express = require('express');
var router = express.Router();
var passport = require('passport');

var models = require('../models');
var basicAuth = passport.authenticate('basic', {session: false});

/*// create a blog
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
});*/

// get one blog writing
router.get('/:id', function(req, res, next) {
  var id = req.params['id'];
  var query = {where: {id: id}};
    console.log("Haetaan blogia id:lla: ", id);
    models.BlogPost.findOne(query).then(function(post) {
    if (post) {
        var jsonObj = post.toJson();
        
        post.getLikers().then(function(likers){
            jsonObj.likes = likers.length;
            return res.status(200).send(jsonObj );
            
        }, function(err) {
            return res.status(500).json({error: 'ServerError'});
        });
        
    }
    else {
      return res.status(404).json({error: 'Blog Post does not exists'});
    }
  });
});


// post's 10 latest comments
router.get('/:id/comments', function(req, res, next) {
 
  var id = req.params['id'];
  var query = {where: {id: id}};
  models.BlogPost.findOne(query).then(function(post) {
    if (post) {
        post.getComments().then(function(comments) {
            var commentArr = [];
            var commentsLength = 0;
            
            if (comments.length < 10) {
                commentsLength = comments.length;
            } else {
                commentsLength = 10;
            }
            
            for (var i = 0; i < commentsLength; ++i) {
                commentArr.push( comments[i].toJson() );
            }
            console.log("commentsLength", commentsLength);
            console.log("commentsArr: ", commentArr);
            return res.status(200).send(commentArr);
        });                        
    }
    else {
      return res.status(404).json({error: 'BlogPostNotFound'});
    }
  });
});

// add new comment
router.post('/:id/comments', requiredAuthentication, function(req, res, next) {
    var id = req.params['id'];
    var query = {where: {id: id}};
    var textField = req.body.text;
    
    if (!textField || textField == "") {
        return res.status(400).json({error: 'InvalidTextField'});
    }
    
    models.BlogPost.findOne(query).then(function(post) {
        if(post) {
            models.Comment.create({
                text: textField,
                author: registered_user
                }).then(function(comment)  {
                    post.addComments( comment );
                    return res.status(201).json({id: comment.id});

            });
        }
        else {
            return res.status(404).json({error: 'BlogPostNotFound'});
        }           
    }, function(err) {
        return res.status(500).json({error: 'ServerError'});
    });
});
            

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