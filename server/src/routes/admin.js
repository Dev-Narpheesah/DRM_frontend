import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

function signAdmin(user) {
  const payload = { id: user.id, email: user.email, isAdmin: true };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}

router.post('/register', (req, res) => {
  const { username, email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const exists = req.db.users.find(u => u.email === email);
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const id = String(Date.now());
  const hash = bcrypt.hashSync(password, 10);
  const user = { id, email, username: username || email, password: hash, isAdmin: true };
  req.db.users.push(user);
  res.json({ user: { id, email, username: user.username, isAdmin: true }, token: signAdmin(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = req.db.users.find(u => u.email === email && u.isAdmin);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ user: { id: user.id, email: user.email, username: user.username, isAdmin: true }, token: signAdmin(user) });
});

router.get('/users', (req, res) => {
  res.json(req.db.users.map(u => ({ id: u.id, email: u.email, username: u.username, isAdmin: !!u.isAdmin })));
});

router.get('/reports', (req, res) => {
  res.json(req.db.reports);
});

router.put('/reports/:id', (req, res) => {
  const r = req.db.reports.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ message: 'Report not found' });
  Object.assign(r, req.body || {});
  res.json(r);
});

router.delete('/reports/:id', (req, res) => {
  const idx = req.db.reports.findIndex(r => r.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'Report not found' });
  const [removed] = req.db.reports.splice(idx, 1);
  res.json(removed);
});

router.delete('/users/:id', (req, res) => {
  const idx = req.db.users.findIndex(u => u.id === req.params.id);
  if (idx < 0) return res.status(404).json({ message: 'User not found' });
  const [removed] = req.db.users.splice(idx, 1);
  res.json({ id: removed.id });
});

export default router;

