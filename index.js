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

app.get('/', (req, res) => {
	res.send('Welcome to the Express API!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
