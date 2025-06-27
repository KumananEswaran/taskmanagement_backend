import express from 'express';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;
import { body, validationResult } from 'express-validator';

import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';

app.use(cors());
app.use(express.json());

const { Pool } = pg;

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

// To add a new task
app.post(
	'/add-task',
	[
		body('title').notEmpty().withMessage('Title is required'),
		body('description').notEmpty().withMessage('Description is required'),
		body('status')
			.isIn(['New', 'In progress', 'Completed'])
			.withMessage('Status must be Pending, In progress, or Completed'),
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, description, status } = req.body;

		try {
			const result = await pool.query(
				`INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *`,
				[title, description, status]
			);
			res
				.status(201)
				.json({ message: `Task added successfully`, task: result.rows[0] });
		} catch (error) {
			console.error('Error:', error);
			res.status(500).send({ error: error.message });
		}
	}
);

// To display all tasks in tasks page
app.get('/tasks', async (req, res) => {
	try {
		const result = await pool.query(`SELECT * FROM tasks ORDER BY id DESC`);
		res.json(result.rows);
	} catch (error) {
		console.error('Error fetching tasks:', error);
		res.status(500).send({ error: error.message });
	}
});

// To edit a task
app.put(
	'/tasks/:id',
	[
		body('status')
			.isIn(['New', 'In progress', 'Completed'])
			.withMessage('Status must be Pending, In progress, or Completed'),
	],

	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { status } = req.body;
		const { id } = req.params;

		try {
			const result = await pool.query(
				'UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *',
				[status, id]
			);
			res
				.status(200)
				.json({ message: 'Task updated successfully', task: result.rows[0] });
		} catch (error) {
			console.error(`Error updating task ID ${req.params.id}:`, error);
			res.status(500).send({ error: error.message });
		}
	}
);

app.get('/', (req, res) => {
	res.send('Welcome to the Express API!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
