// notification.model.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'article',
    enum: ['article']
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Automatically delete after 7 days
  }
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;