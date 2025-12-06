import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from '../Database/connection.js';
import authRoutes from './routes/auth.js';
import geminiRoutes from './routes/gemini.js';
import problemStatusRoutes from './routes/problemStatus.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/problem-status', problemStatusRoutes);

await connectDB();



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
