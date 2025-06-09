// backend/routes/notificationRoutes.js

const express = require('express')
const router = express.Router()

const {
  getNotifications,
  markAsRead
} = require('../controllers/notificationController')

const protect = require('../middleware/authMiddleware')

// GET   /api/notifications          → list this user’s notifications
// PUT   /api/notifications/:id/read → mark a single notification read
router.get('/',          protect, getNotifications)
router.put('/:id/read',  protect, markAsRead)

module.exports = router
