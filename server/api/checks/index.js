var auth = require('../../lib/auth'),
    controller = require('./checks.api'),
    express = require('express'),
    router = express.Router();

router.post('/', auth.authenticate(), controller.create);
router.get('/', controller.retrieveAll);
router.post('/:id/ping', auth.authenticate(), controller.fetchRecord, controller.ping);
router.delete('/:id', auth.authenticate(), controller.fetchRecord, controller.destroy);

module.exports = router;
