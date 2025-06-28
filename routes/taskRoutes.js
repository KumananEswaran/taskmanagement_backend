import express from 'express';

import {
	addTask,
	getTasks,
	updateTask,
	deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.post('/add-task', addTask);
router.get('/tasks', getTasks);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;
