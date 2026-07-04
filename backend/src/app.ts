import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

import analyticsRoutes from '../modules/analytics/routes/analytics.routes';
import dashboardRoutes from '../modules/dashboard/routes/dashboard.routes';
import payrollRoutes from '../modules/payroll/routes/payroll.routes';
import notificationRoutes from '../modules/notifications/routes/notifications.routes';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
