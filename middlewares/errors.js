const ERROR_MESSAGES = require('../utils/constants');

const errors = (err, req, res, next) => {
  if (!err.statusCode) {
    res.status(500).send({ message: ERROR_MESSAGES.SERVER_ERROR });
  } else {
    res.status(err.statusCode).send({ message: err.message });
  }
  next();
};

module.exports = errors;
