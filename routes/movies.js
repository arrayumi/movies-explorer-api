const router = require('express').Router();

const { getSavedMovies, createMovie, deleteSavedMovie } = require('../controllers/movies');
const { validateCreateMovie, validateMovieId } = require('../middlewares/validation');

router.get('/', getSavedMovies);
router.post('/', validateCreateMovie, createMovie);
router.delete('/:_id', validateMovieId, deleteSavedMovie);

module.exports = router;
