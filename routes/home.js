
module.exports = require('./res').create({

  index : function(req, res) {
    this.app.db.getWatches(function(err, watches) {
      res.render('index', { watches : watches });
    });
  }
});
