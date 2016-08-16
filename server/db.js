var bluebird = require('bluebird'),
    config = require('../config'),
    mongoose = require('mongoose');

mongoose.Promise = bluebird;
mongoose.connect(config.db);
