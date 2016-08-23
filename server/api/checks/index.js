var controller = require('./checks.api.controller'),
    express = require('express'),
    router = express.Router();

router.post('/', controller.create);
router.get('/', controller.retrieveAll);
router.delete('/:id', controller.fetchRecord, controller.destroy);

module.exports = router;
