const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const createError = require('http-errors');
import crucible from "./crucible.service";
import slack from "./slack.service";

const reviewsRouter = require('./routes/reviews.route');
const config = require('./config/config');

// database connection
mongoose.connect(config.database, {
  useNewUrlParser: true
});
const connection = mongoose.connection;

connection.once('open', () => {
  console.log(`connected to ${config.database}`);
  crucible.registerReviewInsertedCallback(reviewCreated);
  crucible.registerReviewClosedCallback(reviewClosed);
  crucible.registerReviewAbandonedCallback(reviewAbandoned);
  crucible.pollOpenReviews(() => console.log('polling open reviews'));
});

connection.once('error', (err) => {
  console.log(`database error ${err}`);
});


// review event handlers
function reviewCreated(review) {
  console.log(`!! new review !! ${review.permaId}`)
  slack.reviewCreated(review);
}

function reviewClosed(review) {
  console.log(`!! review closed !! ${review.permaId}`)
  slack.reviewClosed(review);
}

function reviewAbandoned(review) {
  console.log(`!! review abandoned !! ${review.permaId}`)
  slack.reviewClosed(review);
}

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