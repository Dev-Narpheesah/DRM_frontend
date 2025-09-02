import { Router } from 'express';

const router = Router();

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

export default router;

