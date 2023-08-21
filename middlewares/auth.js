const jwt = require('jsonwebtoken');
const config = require('../config');

const UnauthorizedError = require('../errors/unauthorized-err');

const ERROR_MESSAGES = require('../utils/constants');

const auth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) next(new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED));

  let payload;

  try {
    payload = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    next(new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED));
  }

  req.user = payload;
  next();
};

module.exports = auth;
