var express = require('express');
var router = express.Router();
var passport = require('passport');
var basicAuth = passport.authenticate('basic', {session: false});

var models = require('../models');
var models = require('../config/passport');
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
router.get('/', function(req, res) { 
    res.render('login.ejs'); 
      
});

    // process the login form
    
router.post('/', 
	    passport.authenticate('local', {
        successReturnToOrRedirect : '/', 
        failureRedirect : '/login'
}));


router.post('/', function(req, res) {
  res.render('index.ejs');
        
});
/*
function requiredAuthentication(req, res, next) {
    passport.authenticate('local', {session: false});
    if (req.user) {
        next();
    } else {
        basicAuth(req, res, next);
    }
}
*/


module.exports = router;