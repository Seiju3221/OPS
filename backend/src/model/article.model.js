const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  content: {
    type: String,
    required: true,
  },
  coverImg: {
    type: String,
    required: true
  },
  college: {
    required: true,
    type: String
  },
  category: {
    required: true,
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['revision', 'pending', 'published', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  revisionMessage: {
    type: String,
    default: ' '
  },
  rejectionMessage: {
    type: String,
    default: ' '
  },
  revisionDate: {
    type: Date,
    default: Date.now
  },
  rejectionDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: String
  }
});

// Add a method to handle likes
ArticleSchema.methods.toggleLike = async function(userId) {
  const isLiked = this.likes.includes(userId);
  
  if (isLiked) {
    this.likes.pull(userId);
    this.likeCount = Math.max(0, this.likeCount - 1);
  } else {
    this.likes.push(userId);
    this.likeCount += 1;
  }
  
  return this.save();
};

const Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;