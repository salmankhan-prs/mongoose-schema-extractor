
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  tags: [String],
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    body: String,
    date: Date,
  }],
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
