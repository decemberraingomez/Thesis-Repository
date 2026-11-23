/**
 * Author: Jezreel M. Onos
 * Date: November 23, 2026
 * Assignment Title: CSAPPD1 Final Project - Thesis Repository Search Engine
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { seedBootstrapAdmin } = require('./auth/bootstrapAdmin');
const { assertAuthSecret } = require('./auth/token');
const authRoutes = require('./routes/auth');
const thesisRoutes = require('./routes/theses');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/theses', thesisRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    const details = Object.values(error.errors || {}).map((item) => item.message);
    res.status(400).json({ message: 'Validation failed', errors: details });
    return;
  }

  console.error('Unhandled API error:', error.message);
  res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
  try {
    assertAuthSecret();

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const bootstrap = await seedBootstrapAdmin();

    if (bootstrap.created) {
      console.log('Bootstrap admin created in MongoDB');
    } else if (bootstrap.skipped) {
      console.log(
        'Skipping admin bootstrap: set ADMIN_EMAIL and ADMIN_PASSWORD in .env to seed the first administrator.'
      );
    } else {
      console.log('AdminUser collection already has an administrator');
    }

    app.listen(port, () => console.log(`API running on port ${port}`));
  } catch (error) {
    console.error('API startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
