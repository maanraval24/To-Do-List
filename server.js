//server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

dotenv.config(); // Load .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);        // Handles authentication (login, register, remove access, etc.)
app.use('/api/todos', todoRoutes);       // Handles todo-related routes (get, create, update, delete tasks)

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the JWT Auth ToDo API');
});

// Global error handler (Optional but recommended for catching unexpected errors)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error stack (for debugging)
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
