import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import createError from 'http-errors';
import fecru from "./fecru.service";
import slack from "./slack.service";

import reviewsRouter from './routes/reviews.route';
import config from './config/config';

// database connection
mongoose.connect(config.database, {
  useNewUrlParser: true
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log(`connected to ${config.database}`);
  fecru.registerReviewInsertedCallback(reviewCreated);
  fecru.registerReviewClosedCallback(reviewClosed);
  fecru.registerReviewAbandonedCallback(reviewAbandoned);
  fecru.pollOpenReviews(() => console.log('polling open reviews'));
});

connection.once('error', (err) => {
  console.log(`database error ${err}`);
});

// review event handlers
function reviewCreated(review) {
  console.log(`\n\n!! new review !! ${review.permaId}`)
  slack.reviewCreated(review);
}

function reviewClosed(review) {
  console.log(`\n\n!! review closed !! ${review.permaId}`)
  slack.reviewClosed(review);
}

function reviewAbandoned(review) {
  console.log(`\n\n!! review abandoned !! ${review.permaId}`)
  slack.reviewAbandoned(review);
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