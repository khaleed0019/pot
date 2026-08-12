import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import listingRoutes from './routes/listingRoutes.js';

dotenv.config();

if (!process.env.SUPABASE_URL) {
  console.warn('SUPABASE_URL not set — auth will fail on protected routes');
}

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      const isDev = process.env.NODE_ENV !== 'production';
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/[\w-]+\.vercel\.app$/.test(origin) ||
        (isDev && /^http:\/\/localhost(:\d+)?$/.test(origin)) ||
        (isDev && /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin))
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/listings', listingRoutes);

app.get('/', (_req, res) => {
  res.send('Property On Set API is running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
