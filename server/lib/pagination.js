var _ = require('lodash'),
    p = require('bluebird');

module.exports = function(req, res, baseQuery, filter) {

  // Use a wrapper to hold Mongoose queries and avoid problems with promises.
  // (Queries are promises themselves so returning them from a promise will resolve them.)
  var wrapper = {
    query: baseQuery
  };

  function countTotal() {
    return wrapper.query.count().exec().then(function(count) {
      setPaginationTotal(res, count);
    });
  }

  function countFilteredTotal(filteredQuery) {
    return filteredQuery.count().exec().then(function(count) {
      setPaginationFilteredTotal(res, count);
    });
  }

  function applyPagination() {
    var data = setUpPagination(req, res);
    return wrapper.query.skip(data.offset).limit(data.limit).find().exec();
  }

  function checkFiltered() {
    if (filter) {
      return p.resolve(filter(baseQuery)).then(function(result) {
        if (result.query) {
          wrapper.query = result.query;
          return countFilteredTotal(result.query);
        }
      });
    }
  }

  return p.resolve().then(countTotal).then(checkFiltered).then(applyPagination);
};

module.exports.setUpPagination = setUpPagination;
module.exports.setPaginationTotal = setPaginationTotal;
module.exports.setPaginationFilteredTotal = setPaginationFilteredTotal;

function setPaginationTotal(res, count) {
  res.set('X-Pagination-Total', count);
}

function setPaginationFilteredTotal(res, count) {
  res.set('X-Pagination-Filtered-Total', count);
}

function setUpPagination(req, res) {

  var offset = req.query.offset,
      limit = req.query.limit;

  offset = parseInt(offset, 10);
  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }

  limit = parseInt(limit, 10);
  if (isNaN(limit) || limit < 0 || limit > 250) {
    limit = 100;
  }

  res.set('X-Pagination-Offset', offset);
  res.set('X-Pagination-Limit', limit);

  return {
    offset: offset,
    limit: limit
  };
};
