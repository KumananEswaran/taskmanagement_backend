import express from 'express';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;

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
app.post('/add-task', async (req, res) => {
	const { title, description, status } = req.body;

	if (!title || !description || !status) {
		return res.status(400).json({ error: 'All fields are required' });
	}

	try {
		await pool.query(
			`INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *`,
			[title, description, status]
		);
		res.status(201).json({ message: `Task added successfully` });
	} catch (error) {
		console.error('Error:', error);
		res.status(500).send({ error: error.message });
	}
});

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

app.get('/', (req, res) => {
	res.send('Welcome to the Express API!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
