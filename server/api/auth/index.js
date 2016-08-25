var controller = require('./auth.api'),
    express = require('express'),
    router = express.Router();

router.post('/', controller.authenticate);

module.exports = router;
