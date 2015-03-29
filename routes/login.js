var express = require('express');
var router = express.Router();
var passport = require('passport');

var models = require('../models');
var models = require('../config/passport');
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
router.get('/',passport.authenticate('basic', {session: false}), function(req, res) { 
    res.render('login.ejs'); 
      
});

    // process the login form
    /*
router.post('/', 
	    passport.authenticate('local', {
        successReturnToOrRedirect : '/', 
        failureRedirect : '/login',
        failureFlash: true
        
}));
*/
/*
router.post('/', 
        passport.authenticate('basic', {session: false}), function(req, res) {
  res.render('index.ejs');
        
});
*/
module.exports = router;