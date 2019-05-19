import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

let ReviewSchema = new Schema({
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

export const Review = mongoose.model('Review', ReviewSchema);

export function getReviews(callback) {
  Review.find(callback);
}

export function getReviewById(id, callback) {
  Review.findById(id, callback);
}

export function addReview(review, callback) {
  Review.create(review, callback);
}

export function updateReview(id, review, callback) {
  review._id = new ObjectId(id);
  var query = {
    _id: review._id
  };
  Review.updateOne(query, review, callback);
}

export function deleteReview(id, callback) {
  var query = {
    _id: new ObjectId(id)
  };
  Review.deleteOne(query, callback);
}