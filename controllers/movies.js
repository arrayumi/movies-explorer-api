const mongoose = require('mongoose');

const Movie = require('../models/movie');

const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ForbiddenError = require('../errors/forbidden-err');

const getSavedMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      if (movies) res.status(200).send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => {
      res.status(201).send(movie);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ValidationError('Невалидные данные');
      }
      next(error);
    });
};

const deleteSavedMovie = (req, res, next) => {
  const { movieId } = req.params;

  Movie.findByIdAndRemove(movieId)
    .orFail(new NotFoundError('Некорректный id фильма'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) throw new ForbiddenError('Нельзя удалить чужой фильм');
      res.status(200).send({ data: movie });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        throw new ValidationError('Некорректные данные');
      }
      next(error);
    });
};

module.exports = {
  getSavedMovies,
  createMovie,
  deleteSavedMovie,
};
