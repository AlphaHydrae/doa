exports.errorHandler = function(res) {
  return function(err) {

    var data = {};
    if (err.name == 'ValidationError') {
      data.errors = err.errors;
    } else {
      data.errors = [
        {
          message: err.message
        }
      ];
    }

    res.status(500).send(data);
  };
};
