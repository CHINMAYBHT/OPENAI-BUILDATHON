import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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

// Load environment variables (Vercel handles this automatically)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow your Vercel frontend
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://openai-buildathon-rwjy.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
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

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Job Helper API is running' });
});

// Export the Express app for Vercel serverless
export default app;
