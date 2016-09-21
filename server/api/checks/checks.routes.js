var authorize = require('../../lib/auth').authorize,
    controller = require('./checks.api'),
    express = require('express'),
    policy = require('../../models/check').policy,
    router = express.Router(),
    utils = require('../utils');

router.post('/',
  utils.ensureObjectBody(),
  authorize(policy.create),
  controller.create);

router.get('/',
  authorize(policy.index),
  controller.index);

router.get('/:id',
  controller.fetchRecord(),
  authorize(policy.retrieve, true),
  controller.retrieve);

router.post('/:id/ping',
  controller.fetchRecord(),
  authorize(policy.ping, true),
  controller.ping);

router.delete('/:id',
  controller.fetchRecord(),
  authorize(policy.destroy, true),
  controller.destroy);

module.exports = router;
