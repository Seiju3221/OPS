// notifications.route.js
const express = require('express');
const router = express.Router();
const Notification = require('../model/notification.model.js');
const verifyToken = require('../middleware/verifyToken.js');

// Get notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification
      .find()
      .populate({
        path: 'article',
        select: 'title coverImg college',
        populate: {
          path: 'author',
          select: 'username'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10); // Limit to most recent 10 notifications

    res.status(200).json({
      success: true,
      notifications: notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        read: notification.read,
        time: notification.createdAt,
        article: {
          id: notification.article._id,
          title: notification.article.title,
          coverImg: notification.article.coverImg,
          college: notification.article.college,
          author: notification.article.author
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.patch('/read/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
});

// Clear all notifications
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ success: false, message: 'Error clearing notifications' });
  }
});

module.exports = router;