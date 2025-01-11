import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: '1h',
    default: Date.now,
  },
});

const TOKEN_MODEL = mongoose.model('Token', tokenSchema);

export default TOKEN_MODEL;
