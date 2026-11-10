const express = require('express');
const cors = require('cors');
const { validateEnv, port, nodeEnv, clientUrls } = require('./config/env');
const { testConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { requireAuth } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');

validateEnv();

const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientUrls.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'task-management-api', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await testConnection();
    console.log('Connected to MySQL database.');
    app.listen(port, () => {
      console.log(`Task Management API running on http://localhost:${port} (${nodeEnv})`);
    });
  } catch (error) {
    console.error('Failed to connect to MySQL. Check your .env database settings.');
    console.error(error.message);
    process.exit(1);
  }
}

start();

module.exports = app;
