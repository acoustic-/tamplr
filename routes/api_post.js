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

// post's 10 latest comments

router.get('/:id/comments', function(req, res, next) {
 
  var id = req.params['id'];
  var query = {where: {id: id}};
  models.BlogPost.findOne(query).then(function(post) {
    if (post) {
        post.getComments().then(function(comments) {
            return res.status(200).json(comments);
        });                        
    }
    else {
      return res.status(404).json({error: 'BlogNotFound'});
    }
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