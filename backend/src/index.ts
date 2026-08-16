import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import dealRoutes from './routes/dealRoutes.js';

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
app.use('/api/admin', adminRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/deals', dealRoutes);

app.get('/', (_req, res) => {
  res.send('Property On Set API is running');
});

// Without this, an error thrown in middleware (e.g. multer's file-size/type
// rejection, which fires before any controller's own try/catch) falls
// through to Express's built-in handler: an HTML error page instead of this
// API's usual { message } JSON, and a stack trace if NODE_ENV isn't set to
// production exactly right. Must be registered last and keep all 4 params —
// Express only treats a handler as an error handler when it takes 4 args.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[unhandled]', err);

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Each file must be 8MB or smaller' : 'File upload failed';
    res.status(400).json({ message });
    return;
  }

  // `expose: true` (set by cloudinary.ts's fileFilter) marks a message as
  // deliberately client-safe. Everything else stays generic — same reasoning
  // as sendServerError in errorResponse.ts, just for middleware-level errors
  // that never reach a controller's try/catch.
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.expose === true && typeof err?.message === 'string'
    ? err.message
    : 'Something went wrong. Please try again later.';
  res.status(status).json({ message });
};
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
