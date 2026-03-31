const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth, isAdmin } = require('../middleware/auth');

// Tasks
router.get('/', auth, taskController.getAllTasks);
router.post('/', auth, isAdmin, taskController.createTask);
router.put('/:id/progress', auth, taskController.updateTaskProgress);

// Dependencies
router.get('/dependencies', auth, taskController.getDependencies);
router.post('/dependencies', auth, isAdmin, taskController.addDependency);

// Members (For Admin dashboard)
router.get('/members', auth, isAdmin, taskController.getAllMembers);

module.exports = router;
