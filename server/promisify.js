var bcrypt = require('bcryptjs')
    bluebird = require('bluebird');

bluebird.promisifyAll(bcrypt);
