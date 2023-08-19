require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors: celebrateErrors } = require('celebrate');

const app = express();
const routes = require('./routes');

const config = require('./config');
const limiter = require('./middlewares/limiter');

const { PORT, DB_URL } = config;

const errors = require('./middlewares/errors');
const cors = require('./middlewares/cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

mongoose.connect(DB_URL)
  .then(() => {
    console.log('mongoDB connected');
  });

app.use(helmet());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors);
app.use(limiter);

app.use(requestLogger);

app.use('/', routes);

app.use(errorLogger);

app.use(celebrateErrors());
app.use(errors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
