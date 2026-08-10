const Todo = require('../models/todo.model');

// @desc    Get all todos with filtering, search & sorting
// @route   GET /api/todos
exports.getTodos = async (req, res) => {
  try {
    const { search, status, priority, category, sortBy } = req.query;

    let query = {};

    // Filter by completion status
    if (status === 'active') {
      query.completed = false;
    } else if (status === 'completed') {
      query.completed = true;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest first
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'dueDate') {
      sortOption = { due_date: 1 };
    } else if (sortBy === 'priority') {
      // Custom priority order logic could be applied, or sort string
      sortOption = { priority: -1 };
    }

    const todos = await Todo.find(query).sort(sortOption);
    res.status(200).json({ success: true, count: todos.length, data: todos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get todo statistics
// @route   GET /api/todos/stats
exports.getStats = async (req, res) => {
  try {
    const total = await Todo.countDocuments();
    const completed = await Todo.countDocuments({ completed: true });
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        active,
        completionRate
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
exports.createTodo = async (req, res) => {
  try {
    const { title, description, priority, category, due_date } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const todo = await Todo.create({
      title,
      description,
      priority: priority || 'medium',
      category: category || 'General',
      due_date: due_date ? new Date(due_date) : null
    });

    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};



// @desc    Get single todo by ID
// @route   GET /api/todos/:id
exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }
    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid Todo ID format' });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
exports.updateTodo = async (req, res) => {
  try {
    const { title, description, priority, category, due_date, completed } = req.body;

    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (priority !== undefined) todo.priority = priority;
    if (category !== undefined) todo.category = category;
    if (due_date !== undefined) todo.due_date = due_date ? new Date(due_date) : null;
    if (completed !== undefined) todo.completed = completed;

    const updatedTodo = await todo.save();
    res.status(200).json({ success: true, data: updatedTodo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Toggle todo completion status
// @route   PATCH /api/todos/:id/toggle
exports.toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    todo.completed = !todo.completed;
    const updatedTodo = await todo.save();

    res.status(200).json({ success: true, data: updatedTodo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, message: 'Todo not found' });
    }

    res.status(200).json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
