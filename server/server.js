require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'NST Learning Hub API',
    version: '1.0.0',
    message: 'Welcome to NST Learning Hub API',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Core API routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/subjects', require('./src/routes/subjects'));
app.use('/api/topics', require('./src/routes/topics'));
app.use('/api/resources', require('./src/routes/resources'));
app.use('/api/submissions', require('./src/routes/submissions'));

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server - bind to 0.0.0.0 so physical devices on the local network (Expo Go) can connect
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NST Learning Hub API is running:`);
  console.log(`- Local:            http://localhost:${PORT}`);
  console.log(`- On Your Network:  http://10.7.21.130:${PORT} (use this IP for physical phones via Expo Go)`);
});

module.exports = app;
