"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getReviews = getReviews;
exports.getReviewById = getReviewById;
exports.addReview = addReview;
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;
exports.Review = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Schema = _mongoose["default"].Schema;
var ObjectId = _mongoose["default"].Types.ObjectId;
var ReviewSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  trunkUrl: {
    type: String,
    required: true
  },
  slackWebhook: String,
  steps: [StepSchema]
});

var Review = _mongoose["default"].model('Review', ReviewSchema);

exports.Review = Review;

function getReviews(callback) {
  Review.find(callback);
}

function getReviewById(id, callback) {
  Review.findById(id, callback);
}

function addReview(review, callback) {
  Review.create(review, callback);
}

function updateReview(id, review, callback) {
  review._id = new ObjectId(id);
  var query = {
    _id: review._id
  };
  Review.updateOne(query, review, callback);
}

function deleteReview(id, callback) {
  var query = {
    _id: new ObjectId(id)
  };
  Review.deleteOne(query, callback);
}
//# sourceMappingURL=review.model.js.map