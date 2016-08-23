var express = require('express'),
    router = express.Router();

router.use('/checks', require('./checks'));

module.exports = router;
