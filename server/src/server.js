require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();
const PORT = process.env.PORT || 5000;
const rawAllowedOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = rawAllowedOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS blocked for this origin.'));
    },
    credentials: true,
}));
app.use(express.json()); // Parse JSON request bodies

// 3. Routes setup
app.use('/api/chat', chatRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/counselor', require('./routes/counselorRoutes'));

// Standardized health check
app.get('/health', (req, res) => {
    sendSuccess(res, { status: 'API is running successfully' });
});

// 4. Global Error Handling Middleware (must be after routes)
app.use(errorHandler);

// 5. Start the Express server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Test server health at: http://localhost:${PORT}/health`);
});
