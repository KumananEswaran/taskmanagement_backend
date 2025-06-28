import pool from '../config/db';

// To add a new task
export const addTask = async (req, res) => {
	const { title, description, status } = req.body;

	if (!title || !description) {
		return res
			.status(400)
			.json({ success: false, message: 'Title and description are required' });
	}

	if (!['New', 'In progress', 'Completed'].includes(status)) {
		return res.status(400).json({
			success: false,
			message: 'Status must be New, In progress, or Completed',
		});
	}

	try {
		const addedTask = await pool.query(
			`INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *`,
			[title, description, status]
		);
		return res.status(201).json({
			success: true,
			message: `Task added successfully`,
			data: addedTask.rows[0],
		});
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
};

// To display all tasks in tasks page
export const getTasks = async (req, res) => {
	try {
		const result = await pool.query(`SELECT * FROM tasks ORDER BY id DESC`);
		res.status(200).json({
			success: true,
			data: result.rows,
		});
	} catch (error) {
		console.error('Error fetching tasks:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
};

// To edit a task
export const updateTask = async (req, res) => {
	const { status } = req.body;
	const { id } = req.params;

	if (!['New', 'In progress', 'Completed'].includes(status)) {
		return res.status(400).json({
			success: false,
			message: 'Status must be New, In progress, or Completed',
		});
	}

	try {
		const updatedTask = await pool.query(
			'UPDATE tasks SET status=$1 WHERE id=$2 RETURNING *',
			[status, id]
		);

		// if no task is found with that id
		if (updatedTask.rowCount === 0) {
			return res
				.status(404)
				.json({ success: false, message: 'Task not found' });
		}

		return res.status(200).json({
			success: true,
			message: 'Task updated successfully',
			data: updatedTask.rows[0],
		});
	} catch (error) {
		console.error(`Error updating task ID ${req.params.id}:`, error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
};

// To delete a task
export const deleteTask = async (req, res) => {
	const { id } = req.params;

	try {
		const deletedTask = await pool.query(
			'DELETE FROM tasks WHERE id=$1 RETURNING *',
			[id]
		);

		// if task is not found
		if (deletedTask.rowCount === 0) {
			return res
				.status(404)
				.json({ success: false, message: 'Task not found' });
		}

		return res.status(200).json({
			success: true,
			message: 'Task deleted successfully',
			data: deletedTask.rows[0],
		});
	} catch (error) {
		console.error(`Error deleting task ID ${req.params.id}:`, error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
};
