const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Accessible routes for student dashboard
router.get('/', auth(['student']), projectController.getAllProjects);
router.get('/leaderboard', auth(['student']), projectController.getLeaderboard);
router.get('/:id', auth(['student']), projectController.getProjectById);

module.exports = router;
