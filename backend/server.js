const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const repRoutes = require('./routes/reps');
const actionRoutes = require('./routes/actions');
const reportRoutes = require('./routes/reports');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wazifni';

// Check if we are in production (Vercel) to avoid connection logs spam or handle differently
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
    });
}

// Routes
app.use('/api/reps', repRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/reports', reportRoutes);

// Serve static files from frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Default route to rep.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'rep.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;