import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

const router = Router();
const upload = multer({ dest: path.join('server', 'uploads') });

function sign(user) {
  const payload = { id: user.id, email: user.email, isAdmin: !!user.isAdmin };
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}

router.post('/register', (req, res) => {
  const { email, password, username } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const existing = req.db.users.find(u => u.email === email);
  if (existing) return res.status(409).json({ message: 'Email already registered' });
  const id = String(Date.now());
  const hash = bcrypt.hashSync(password, 10);
  const user = { id, email, username: username || email.split('@')[0], password: hash, isAdmin: false, profilePic: null };
  req.db.users.push(user);
  res.json({ id, email: user.email, username: user.username, token: sign(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = req.db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ id: user.id, email: user.email, username: user.username, token: sign(user) });
});

// Basic user CRUD for UpdateUser component compatibility
router.get('/user/:id', (req, res) => {
  const user = req.db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, email: user.email, username: user.username, isAdmin: !!user.isAdmin, profilePic: user.profilePic || null });
});

router.put('/user/:id', (req, res) => {
  const user = req.db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { email, username } = req.body || {};
  if (email) user.email = email;
  if (username) user.username = username;
  res.json({ id: user.id, email: user.email, username: user.username, isAdmin: !!user.isAdmin, profilePic: user.profilePic || null });
});

router.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = req.db.users.find(u => u.id === String(payload.id));
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, email: user.email, username: user.username, isAdmin: !!user.isAdmin, profilePic: user.profilePic || null });
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/profile-pic', upload.single('image'), (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret'); } catch { return res.status(401).json({ message: 'Invalid token' }); }
  const user = req.db.users.find(u => u.id === String(payload.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!req.file) return res.status(400).json({ message: 'Image required' });
  user.profilePic = `/uploads/${req.file.filename}`;
  res.json({ profilePic: user.profilePic });
});

export default router;

