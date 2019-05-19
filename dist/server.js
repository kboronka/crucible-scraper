"use strict";

var _crucibleApi = _interopRequireDefault(require("./crucible-api"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var express = require('express');

var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var createError = require('http-errors');

var reviewsRouter = require('./routes/reviews.route');

var config = require('./config/config'); // database connection


mongoose.connect(config.database, {
  useNewUrlParser: true
});
var connection = mongoose.connection;
connection.once('open', function () {
  console.log("connected to ".concat(config.database));
});
connection.once('error', function (err) {
  console.log("database error ".concat(err));
}); // express

var app = express();
app.use(bodyParser.json());
app.use('/projects', reviewsRouter); // catch 404 and forward to error handler

app.use(function (req, res, next) {
  next(createError(404));
}); // error handler

app.use(function (err, req, res, next) {
  var statusCode = err.status || 500;
  res.status(statusCode).json({
    code: statusCode,
    message: err.message
  });
});
app.listen(config.port, '0.0.0.0', function () {
  return console.log("listening on port ".concat(config.port));
});

_crucibleApi["default"].getReviews(config.crucibleUrl, function (err, res) {
  if (err) {
    console.log(err);
  } else {
    console.log(res);
  }
});
//# sourceMappingURL=server.js.map