var _ = require('lodash');

exports.ensureObjectBody = function(required) {

  required = required !== undefined ? required : true;

  return function(req, res, next) {
    if (_.isObject(req.body) || (!required && !_.has(req, body))) {
      next();
    } else {
      next(new Error('Request body must be an object'));
    }
  };
};

exports.fetchRecord = function(findRecordFunc, required, idReqPath, recordReqProperty) {
  if (!_.isFunction(findRecordFunc)) {
    throw new Error('Find record function is required');
  }

  required = required !== undefined ? required : true;
  idReqPath = idReqPath || 'params.id';
  recordReqProperty = recordReqProperty || 'record';

  return function(req, res, next) {

    var id = _.get(req, idReqPath);
    if (!id && required) {
      return res.sendStatus(404);
    }

    findRecordFunc(id).then(function(check) {
      if (!check && required) {
        return res.sendStatus(404);
      } else if (check) {
        req[recordReqProperty] = check;
      }

      next();
    }).catch(next);
  };
}
