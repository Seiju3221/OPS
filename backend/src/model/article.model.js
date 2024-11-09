const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  content: {
    type: Object,
    required: true,
  },
  coverImg: String,
  category: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Article = mongoose.model("Article", ArticleSchema)

module.exports = Article;