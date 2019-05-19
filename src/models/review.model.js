import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

let ReviewSchema = new Schema({
  projectKey: {
    type: String,
    required: true
  },
  permaId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  creator: {
    userName: String,
    displayName: String,
    avatarUrl: String
  },
  author: {
    userName: String,
    displayName: String,
    avatarUrl: String
  },
  moderator: {
    userName: String,
    displayName: String,
    avatarUrl: String
  },
  createDate: Date,
  dueDate: Date,
  hasDefects: Boolean,
  isComplete: Boolean,
  reviewers: [{
    userName: String,
    displayName: String,
    avatarUrl: String,
    completed: Boolean,
    timeSpent: Number
  }]
});

const Review = module.exports = mongoose.model('Review', ReviewSchema);

module.exports.findAllReviews = function(callback) {
  Review.find(callback);
}

module.exports.findReviewById = function(id, callback) {
  Review.findById(id, callback);
}

module.exports.upsertReview = function(review, callback) {
  var query = { 'permaId': review.permaId };
  Review.updateOne(query, review, { upsert: true }, callback);
}

module.exports.deleteReview = function(id, callback) {
  var query = {
    _id: new ObjectId(id)
  };
  Review.deleteOne(query, callback);
}