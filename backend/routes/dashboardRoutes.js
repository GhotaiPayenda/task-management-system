const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', dashboardController.getStats);
router.get('/recent-tasks', dashboardController.getRecentTasks);
router.get('/upcoming-tasks', dashboardController.getUpcomingTasks);

module.exports = router;
