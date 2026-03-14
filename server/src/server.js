require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Connect to MongoDB
connectDB();

// 2. Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON request bodies

// 3. Routes setup
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

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
