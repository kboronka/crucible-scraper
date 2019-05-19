import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const UserSchema = new Schema({
  userName: String,
  displayName: String,
  avatarUrl: String,
});

export const User = mongoose.model('User', UserSchema);