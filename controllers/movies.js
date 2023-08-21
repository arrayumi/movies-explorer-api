const mongoose = require('mongoose');

const Movie = require('../models/movie');

const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ForbiddenError = require('../errors/forbidden-err');

const ERROR_MESSAGES = require('../utils/constants');

const getSavedMovies = (req, res, next) => {
  const owner = req.user._id;
  Movie.find({ owner })
    .then((movies) => {
      if (movies) res.status(200).send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  Movie.create({ owner: req.user._id, ...req.body })
    .then((movie) => {
      res.status(201).send(movie);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new ValidationError(ERROR_MESSAGES));
      }
      next(error);
    });
};

const deleteSavedMovie = (req, res, next) => {
  const movieId = req.params;

  Movie.findById({ _id: movieId })
    .orFail(new NotFoundError(ERROR_MESSAGES.MOVIE_NOT_FOUND))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError(ERROR_MESSAGES.FORBIDDEN);
      }
      return Movie.findByIdAndRemove({ _id: movie.movieId })
        .then((deletedMovie) => res.status(200).send(deletedMovie))
        .catch(next);
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new ValidationError(ERROR_MESSAGES.NOT_VALID));
      }
      next(error);
    });
};

module.exports = {
  getSavedMovies,
  createMovie,
  deleteSavedMovie,
};
