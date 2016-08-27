var auth = require('../../lib/auth'),
    controller = require('./users.api'),
    express = require('express'),
    router = express.Router();

router.post('/', auth.authenticate(), controller.create);

module.exports = router;
