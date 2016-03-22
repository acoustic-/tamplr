var express = require('express');
var router = express.Router();

var models = require('../models');

router.get('/', function(req, res, next) {
    
    var str = '{ "group": "wolverine" }';
    var group = JSON.parse(str);
    //var group = '{"\group"\:"\wolverine"\}';
    return res.status(200).json(group);
});

module.exports = router;