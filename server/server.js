import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// config ENV variables
dotenv.config();

// CORS and Connect DB
import cors from 'cors';
import connectDB from './config/db.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Routes
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const PORT = process.env.PORT || 4000;

// Connect to the DB
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Enable CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Routes handler middleware
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Route for Upload product images
app.use('/api/upload', uploadRoutes);

// use Static assets
const __dirname = path.resolve();
app.use(
  '/uploads',
  express.static(path.join(__dirname, '/client/public/uploads'))
);

// Paypal API
app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

// Custom Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, 'localhost', () =>
  console.log(`Server listening on ${PORT} 🚀`)
);
