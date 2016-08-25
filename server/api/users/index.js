var controller = require('./users.api'),
    express = require('express'),
    router = express.Router();

router.post('/', controller.create);

module.exports = router;
