const dashboardModel = require('../models/dashboardModel');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const [stats, statusOverview, priorityOverview] = await Promise.all([
    dashboardModel.getStats(),
    dashboardModel.getStatusOverview(),
    dashboardModel.getPriorityOverview(),
  ]);
  res.json({ stats, statusOverview, priorityOverview });
});

const getRecentTasks = asyncHandler(async (req, res) => {
  const tasks = await dashboardModel.getRecentTasks(req.query.limit);
  res.json({ tasks });
});

const getUpcomingTasks = asyncHandler(async (req, res) => {
  const tasks = await dashboardModel.getUpcomingTasks(req.query.limit);
  res.json({ tasks });
});

module.exports = { getStats, getRecentTasks, getUpcomingTasks };
