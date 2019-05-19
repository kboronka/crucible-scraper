const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const createError = require('http-errors');
import Crucible from "./crucible-api";

const reviewsRouter = require('./routes/reviews.route');
const config = require('./config/config.x');

// database connection
mongoose.connect(config.database, {
  useNewUrlParser: true
});
const connection = mongoose.connection;

connection.once('open', () => {
  console.log(`connected to ${config.database}`);
  Crucible.pollOpenReviews(() => console.log('polling open reviews'));
});

connection.once('error', (err) => {
  console.log(`database error ${err}`);
});

// express
const app = express();
app.use(bodyParser.json());
app.use('/projects', reviewsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  var statusCode = err.status || 500;
  res.status(statusCode).json({
    code: statusCode,
    message: err.message
  });
});

app.listen(config.port, '0.0.0.0', () => console.log(`listening on port ${config.port}`));