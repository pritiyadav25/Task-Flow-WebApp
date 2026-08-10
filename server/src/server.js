const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const todoRoutes = require('./routes/todo.routes');

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());// this is builtin middlewear that read incomming json data sent by client and convert it into JS objecct attached by req.body
app.use(express.urlencoded({ extended: true })); //builtinmiddlewear

// Serve Frontend Static Files from 'client' folder
app.use(express.static(path.join(__dirname, '../../client')));

// Health Check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Todo Backend API is running' });
});

// API Routes
app.use('/api/todos', todoRoutes);

// Fallback to index.html for client route requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

