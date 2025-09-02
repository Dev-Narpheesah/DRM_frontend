import { Router } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import path from 'path';

const router = Router();
const upload = multer({ dest: path.join('server', 'uploads') });

function getUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET || 'dev_secret'); } catch { return null; }
}

router.get('/', (req, res) => {
  res.json(req.db.reports);
});

router.get('/:id', (req, res) => {
  const r = req.db.reports.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ message: 'Report not found' });
  res.json(r);
});

router.get('/my', (req, res) => {
  const email = req.query.email;
  const authUser = getUser(req);
  const mine = req.db.reports.filter(r => (email ? r.email === email : authUser ? r.userId === String(authUser.id) : false));
  res.json(mine);
});

router.post('/', upload.single('image'), (req, res) => {
  const user = getUser(req);
  const { email, phone, disasterType, location, report, createdAt } = req.body || {};
  if (!req.file) return res.status(400).json({ message: 'Image required' });
  const id = String(Date.now());
  const newReport = {
    id,
    userId: user ? String(user.id) : null,
    email: email || null,
    phone: phone || null,
    disasterType: disasterType || 'Unknown',
    location: location || '',
    report: report || '',
    createdAt: createdAt || new Date().toISOString(),
    imageUrl: `/uploads/${req.file.filename}`,
    status: 'Pending'
  };
  req.db.reports.unshift(newReport);
  res.status(201).json(newReport);
});

export default router;

