
var _ = require('underscore'),
    cron = require('cron');

var Logger = require('./logger');

var Scheduler = function(app) {
  this.app = app;
  this.log = new Logger('scheduler', app.config);
};

_.extend(Scheduler.prototype, {

  start : function() {
    this.stop();
    this.job = new cron.CronJob({
      cronTime : '*/10 * * * * *',
      onTick : _.bind(this.trigger, this),
      start : true,
      timeZone : 'UTC'
    });
    this.log.debug('Started to trigger watch every 10 seconds');
  },

  stop : function() {
    if (this.job) {
      this.job.stop();
    }
  },

  trigger : function() {
    this.app.emit('watch');
  }
});

module.exports = Scheduler;