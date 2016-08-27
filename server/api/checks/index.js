var auth = require('../../lib/auth'),
    controller = require('./checks.api'),
    express = require('express'),
    router = express.Router();

router.post('/', auth.authenticate(), controller.create);
router.get('/', controller.retrieveAll);
router.delete('/:id', controller.fetchRecord, controller.destroy);

module.exports = router;
