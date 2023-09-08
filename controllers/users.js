const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ConflictError = require('../errors/conflict-err');
const UnauthorizedError = require('../errors/unauthorized-err');

const ERROR_MESSAGES = require('../utils/constants');

const SALT_ROUNDS = 10;

const getUserInfo = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND))
    .then((user) => {
      if (!user) {
        throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
      } else {
        res.status(200).send({ name: user.name, email: user.email });
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new ValidationError(ERROR_MESSAGES.NOT_VALID));
      }
      next(error);
    });
};

const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      res.status(200).send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ValidationError(ERROR_MESSAGES.NOT_VALID));
      }
      if (error.code === 11000) {
        next(new ConflictError(ERROR_MESSAGES.USER_CONFLICT));
      }
      next(error);
    });
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  User.findOne({ email })
    .then((userExists) => {
      if (userExists) {
        throw new ConflictError(ERROR_MESSAGES.USER_CONFLICT);
      }
      bcrypt.hash(password, SALT_ROUNDS)
        .then((hash) => User.create({
          name,
          email,
          password: hash,
        }))
        .then((user) => {
          res.status(201).send({
            _id: user._id, name, email,
          });
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.ValidationError) {
            next(new ValidationError(ERROR_MESSAGES.NOT_VALID));
          }
          next(error);
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ValidationError(ERROR_MESSAGES.NOT_VALID);
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) throw new UnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
      else {
        bcrypt.compare(password, user.password)
          .then((isPasswordValid) => {
            if (!isPasswordValid) throw new UnauthorizedError(ERROR_MESSAGES.WRONG_CREDENTIALS);
            const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
            res
              .cookie('jwt', token, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
                sameSite: 'none',
                secure: true,
              })
              .status(200)
              .send({ token });
          })
          .catch(next);
      }
    })
    .catch(next);
};

const logout = (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
};

module.exports = {
  getUserInfo,
  updateUserInfo,
  createUser,
  login,
  logout,
};
