import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const ReviewerSchema = new Schema({
  userName: String,
  displayName: String,
  avatarUrl: String,
  completed: Boolean,
  timeSpent: Number
});

export const Reviewer = mongoose.model('Reviewer', ReviewerSchema);