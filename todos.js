const express = require('express');
const router = express.Router();
const todoController = require('../controller/todoController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// All users can view, add, update tasks
router.get('/', authenticateToken, todoController.getTodos);
router.post('/', authenticateToken, todoController.createTodo);
router.put('/:id', authenticateToken, todoController.updateTodo);
router.delete('/:id', authenticateToken, todoController.deleteTodo);

module.exports = router;

