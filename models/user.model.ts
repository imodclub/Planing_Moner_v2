// models/user.model.js
import mongoose, { Document, Schema } from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'users' }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;