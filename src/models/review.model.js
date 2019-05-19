import mongoose from 'mongoose';
import { UserSchema } from './user.model';
import { ReviewerSchema } from './reviewer.model';

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
  creator: UserSchema,
  author: UserSchema,
  moderator: UserSchema,
  createDate: Date,
  dueDate: Date,
  hasDefects: Boolean,
  isComplete: Boolean,
  reviewers: [ReviewerSchema]
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