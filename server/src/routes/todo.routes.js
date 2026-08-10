const express = require('express');
const router = express.Router();
const {
  getTodos,
  getStats,
  createTodo,
  getTodoById,
  updateTodo,
  toggleTodo,
  deleteTodo
} = require('../controllers/todo.controller');

// Router endpoints
router.route('/stats').get(getStats);
router.route('/').get(getTodos).post(createTodo);
router.route('/:id').get(getTodoById).put(updateTodo).delete(deleteTodo);
router.route('/:id/toggle').patch(toggleTodo);

module.exports = router;



