const Notification = require('../models/notificationModel');

// helper for other controllers to call:
exports.createNotification = async (userId, message) => {
  try {
    await Notification.create({ user: userId, message });
  } catch (err) {
    console.error('Failed to write notification:', err);
  }
};

// GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    // latest first, unread first
    const notes = await Notification
      .find({ user: req.user._id })
      .sort({ read: 1, createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch notifications' });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const note = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Not found' });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not mark as read' });
  }
};
