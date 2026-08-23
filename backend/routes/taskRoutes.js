const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateTask,
  validateTaskUpdate,
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Apply Authentication Middleware to ALL task routes in this pipeline
router.use(authMiddleware);

// ==========================================
// 1. GET /tasks
// Fetch all tasks for the logged-in user
// ==========================================
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. GET /tasks/:id
// Fetch single task by ID (User-scoped)
// ==========================================
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: `Task with ID ${req.params.id} was not found or does not belong to you.`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. POST /tasks
// Create a new task for the authenticated user
// ==========================================
router.post('/', validateTask, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const task = new Task({
      user: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: completed === true,
      priority: priority || 'medium',
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created and secured with JWT ownership.',
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. PUT /tasks/:id
// Update a task (User-scoped)
// ==========================================
router.put('/:id', validateTaskUpdate, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: `Task with ID ${req.params.id} was not found or does not belong to you.`,
      });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (completed !== undefined) task.completed = Boolean(completed);
    if (priority !== undefined) task.priority = priority;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. DELETE /tasks/:id
// Delete a task (User-scoped)
// ==========================================
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: `Task with ID ${req.params.id} was not found or does not belong to you.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully from database.',
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
