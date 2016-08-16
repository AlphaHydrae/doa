var express = require('express'),
    router = express.Router(),
    utils = require('./utils');

router.use('/checks', require('./checks'));

module.exports = router;
