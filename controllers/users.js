const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ConflictError = require('../errors/conflict-err');
const UnauthorizedError = require('../errors/unauthorized-err');

const SALT_ROUNDS = 10;

const getUserInfo = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(new NotFoundError('Пользователь по данному id не найден'))
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по данному id не найден');
      } else {
        res.status(200).send({ name: user.name, email: user.email });
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new ValidationError('Некорректные данные'));
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
        throw new NotFoundError('Пользователь по данному id не найден');
      }
      res.status(200).send(user);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ValidationError('Некорректные данные'));
      }
      if (error.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
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
        throw new ConflictError('Пользователь с таким email уже зарегистрирован');
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
            next(new ValidationError('Невалидные данные'));
          }
          next(error);
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ValidationError('Поля email или пароль не могут быть пустыми');
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) throw new UnauthorizedError('Пользователь с таким email не существует');
      else {
        bcrypt.compare(password, user.password)
          .then((isPasswordValid) => {
            if (!isPasswordValid) throw new UnauthorizedError('Пароль указан неверно');
            const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
            res
              .cookie('jwt', token, {
                maxAge: 3600 * 24 * 7,
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
