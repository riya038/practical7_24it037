/**
 * Validation Middleware Pipeline
 * Intercepts malformed or invalid client requests before reaching database controllers
 */

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Name is required and must be at least 2 characters long.';
  }

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'A valid email address is required.';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.password = 'Password is required and must be at least 6 characters long.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Registration data failed validation.',
      details: errors,
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Please provide a valid registered email address.';
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Login credentials failed validation.',
      details: errors,
    });
  }

  next();
};

const validateTask = (req, res, next) => {
  const { title, priority } = req.body;
  const errors = {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.title = 'Task title is required and cannot be blank.';
  }

  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    errors.priority = 'Priority must be one of: low, medium, high.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Task creation data failed validation.',
      details: errors,
    });
  }

  next();
};

const validateTaskUpdate = (req, res, next) => {
  const { title, priority } = req.body;
  const errors = {};

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    errors.title = 'Task title cannot be empty.';
  }

  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    errors.priority = 'Priority must be one of: low, medium, high.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Task update data failed validation.',
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTask,
  validateTaskUpdate,
};
