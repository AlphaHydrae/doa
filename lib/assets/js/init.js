
Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
  return Mustache.compile(rawTemplate);
};

var Translations;

$(function() {
  Translations = $('body').data('translations');
});