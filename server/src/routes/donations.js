import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json(req.db.donations);
});

router.post('/verify', (req, res) => {
  const { txRef, amount, email } = req.body || {};
  if (!txRef || !amount) return res.status(400).json({ message: 'Missing txRef or amount' });
  const entry = { id: String(Date.now()), txRef, amount: Number(amount), email: email || null, verified: true, createdAt: new Date().toISOString() };
  req.db.donations.push(entry);
  res.json({ status: 'success', data: entry });
});

export default router;

