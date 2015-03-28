var express = require('express');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var models = require('../models');

//add user
router.post('/', function(req, res, next) {

  var username = req.body.username;
  var name = req.body.name;
  var password = req.body.password;
  if (!username || !password || !name ) {
    return res.status(400).json({error: 'InvalidUserName'});
  }

    // check if username previously exists
  var query = {where: {username: username}};
  models.User.findOne(query).then(function(user) {
    if (user) {
      return res.status(409)
      .json({error:'UserAlreadyExists'});
    } else {
        models.User.create({
        username: username,
        name: name,
        password: password
        }).then(function(user) {
        return res.status(201);
        },
        function(err) {
            return res.status(500).json({error: 'ServerError'});
        });
    }
  });
});


//get user information
//ensureLoggedIn('/login') == check that user is logged, if redirect to login page
//router.get('/:username', ensureLoggedIn('/login'), function(req, res) {
//res.render('/:username');
//});

router.get('/:username', function(req, res, next) {


  var username = req.params['username'];
  var query = {where: {username: username}};
  models.User.findOne(query).then(function(user) {
    if (user) {
      return res.status(200).json(user.toJson());
    }
    else {

      return res.status(404).json({error: 'UserNotFound'});
    }
  });
  // router.put
});



/*
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
*/


module.exports = router;
