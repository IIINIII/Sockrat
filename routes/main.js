var express = require('express');
var router = express.Router();

/* Controllers */
var index = require('../app/controllers/index_controller');

/* GET home page. */
router.get('/', index.home);

module.exports = router;
