import { Router } from 'express';

const router = Router();

router.get('/likes/:reportId/count', (req, res) => {
  const { reportId } = req.params;
  const reactions = (req.db.likes[reportId] || []);
  const counts = reactions.reduce((acc, r) => { acc[r.type] = (acc[r.type]||0)+1; return acc; }, {});
  res.json({ total: reactions.length, counts });
});

router.post('/likes/:reportId/toggle', (req, res) => {
  const { reportId } = req.params;
  const { type = 'like', sessionId = 'anon' } = req.body || {};
  const list = req.db.likes[reportId] = req.db.likes[reportId] || [];
  const idx = list.findIndex(r => r.sessionId === sessionId);
  if (idx >= 0) list.splice(idx, 1); else list.push({ type, sessionId });
  res.json({ ok: true });
});

router.get('/likes/:reportId/reactions', (req, res) => {
  const { reportId } = req.params;
  res.json(req.db.likes[reportId] || []);
});

router.get('/comments/:reportId', (req, res) => {
  const { reportId } = req.params;
  res.json(req.db.comments[reportId] || []);
});

router.post('/comments/:reportId', (req, res) => {
  const { reportId } = req.params;
  const { text, userId } = req.body || {};
  if (!text) return res.status(400).json({ message: 'Text required' });
  const item = { id: String(Date.now()), text, userId: userId || null, createdAt: new Date().toISOString() };
  const list = req.db.comments[reportId] = req.db.comments[reportId] || [];
  list.push(item);
  res.status(201).json(item);
});

router.get('/ratings/:reportId/stats', (req, res) => {
  const { reportId } = req.params;
  const items = req.db.ratings[reportId] || [];
  const avg = items.length ? items.reduce((a, b) => a + b.value, 0) / items.length : 0;
  res.json({ average: avg, count: items.length });
});

export default router;

