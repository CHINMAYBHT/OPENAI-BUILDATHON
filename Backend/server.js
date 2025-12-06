import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from '../Database/connection.js';
import authRoutes from './routes/auth.js';
import geminiRoutes from './routes/gemini.js';
import problemStatusRoutes from './routes/problemStatus.js';
import companiesRoutes from './routes/companies.js';
import companyProgressRoutes from './routes/companyProgress.js';
import userLanguagesRoutes from './routes/userLanguages.js';
import userStreaksRoutes from './routes/userStreaks.js';
import userStatsRoutes from './routes/userStats.js';
import userActivityRoutes from './routes/userActivity.js';
import interviewRoutes from './routes/interviewSimulator.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow all origins for development, restrict in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || '*'
        : '*',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/problem-status', problemStatusRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/company-progress', companyProgressRoutes);
app.use('/api/user-languages', userLanguagesRoutes);
app.use('/api/user-streaks', userStreaksRoutes);
app.use('/api/user-stats', userStatsRoutes);
app.use('/api/user-activity', userActivityRoutes);
app.use('/api/interview', interviewRoutes);

await connectDB();



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
