var authorize = require('../../lib/auth').authorize,
    controller = require('./users.api'),
    express = require('express'),
    policy = require('../../models/user').policy,
    router = express.Router();

router.post('/',
  authorize(policy.create),
  controller.create);

module.exports = router;
