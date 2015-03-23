var express = require('express');
var router = express.Router();

var models = require('../models');


router.post('/', function(req, res, next) {

  // TODO

  var id = req.body.id;
  var name = req.body.name;
  if (!name) {
    return res.status(400).json({error: 'InvalidUserName'});
  }
  models.Blog.create({
    name: name,
    id: "1"
  }).then(function(blog) {
    return res.status(201).json(id);
  },
  function(err) {
    return res.status(500).json({error: 'ServerError'});
  });
});


router.get('/:id', function(req, res, next) {

  // TODO

  var id = req.params['id'];
  var query = {where: {id: id}};
  models.Blog.findOne(query).then(function(blog) {
    if (blog) {
      return res.json(blog);
    }
    else {
      return res.status(404).json({error: 'BlogNotFound'});
    }
  });
});

module.exports = router;