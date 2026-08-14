import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import posRoutes from './routes/pos.routes';
import customerRoutes from './routes/customer.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';
import pricelistRoutes from './routes/pricelist.routes';
import settingsRoutes from './routes/settings.routes';
import branchRoutes from './routes/branch.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/pricelists', pricelistRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/branches', branchRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sales Management API', time: new Date().toISOString() });
});

export default app;
