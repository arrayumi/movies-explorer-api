const ERROR_MESSAGES = {
  USER_CONFLICT: 'Пользователь с таким email уже зарегистрирован',
  MOVIE_CONFLICT: 'Фильм с таким id уже существует',
  NOT_VALID: 'Невалидные данные',
  FORBIDDEN: 'Нет прав для выполнения действия',
  USER_NOT_FOUND: 'Пользователь не найден',
  MOVIE_NOT_FOUND: 'Фильм не найден',
  PAGE_NOT_FOUND: 'Неверный адрес запроса',
  WRONG_CREDENTIALS: 'Неверные данные для входа',
  UNAUTHORIZED: 'Для обработки запроса необходима авторизация',
  SERVER_ERROR: 'На сервере произошла ошибка',
};

module.exports = ERROR_MESSAGES;
