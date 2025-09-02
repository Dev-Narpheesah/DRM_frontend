import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// In-memory stores (replace with DB later)
const db = {
  users: [],
  reports: [],
  likes: {},
  comments: {},
  ratings: {},
  donations: []
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'drm-backend', timestamp: new Date().toISOString() });
});

import authRouter from './routes/auth.js';
import reportsRouter from './routes/reports.js';
import socialRouter from './routes/social.js';
import donationsRouter from './routes/donations.js';
import adminRouter from './routes/admin.js';

app.use((req, res, next) => { req.db = db; next(); });
app.use('/api/auth', authRouter);
// Legacy compatibility for frontend expecting /api/user/*
app.use('/api/user', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api', socialRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/admin', adminRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`DRM backend running on http://localhost:${PORT}`);
});

