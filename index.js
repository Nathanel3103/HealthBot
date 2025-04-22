const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const webhookRoutes = require('./routes/webhook');
const connectToDatabase = require('./config/mongodb');
require('dotenv').config();

// Connect to MongoDB
connectToDatabase();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // ✅ Needed to parse Twilio webhook payloads
// Respond no favicon to prevent 404s

app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// Serve static files (including favicon)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/webhook', webhookRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('WhatsApp chatbot backend is running!');
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
