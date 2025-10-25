import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const mongoURI = process.env.MONGO_URI;

// ------------------------------------
// MongoDB Connection
// ------------------------------------
mongoose.connect(mongoURI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const allowedOrigins = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173' // This is the origin reported by your error!
];

const corsOptions = {
    origin: (origin, callback) => {
        // Check if the origin is in our list or if the request has no origin (like mobile/postman)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allows cookies and authorization headers
    optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json()); // Allows parsing of JSON request bodies

// ------------------------------------
// Register Calculator Routes
// ------------------------------------
import calculatorRoutes from './routes/calculatorRoutes.js'; 
app.use('/api/calculator', calculatorRoutes);

// ------------------------------------
// Basic Route to Test Connection
// ------------------------------------
app.get('/', (req, res) => {
  res.send('Server is running and connected to MongoDB.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});