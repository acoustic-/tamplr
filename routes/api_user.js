var express = require('express');
var router = express.Router();

var models = require('../models');


router.post('/', function(req, res, next) {

  // TODO

  var username = req.body.username;
  var password = req.body.password;
  if (!username) {
    return res.status(400).json({error: 'InvalidUserName'});
  }
  models.User.create({
    username: username,
    password: password
  }).then(function(user) {
    return res.status(201).json(user);
  },
  function(err) {
    return res.status(500).json({error: 'ServerError'});
  });
});


router.get('/:username', function(req, res, next) {

  // TODO

  var username = req.params['username'];
  var query = {where: {username: username}};
  models.User.findOne(query).then(function(user) {
    if (user) {
      return res.json(user);
    }
    else {
      return res.status(404).json({error: 'UserNotFound'});
    }
  });
});

module.exports = router;
