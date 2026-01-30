import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  res.json(data.portfolio);
});

router.put('/', (req, res) => {
  const portfolio = req.body;
  if (!Array.isArray(portfolio)) return res.status(400).json({ error: 'portfolio must be an array' });
  const data = store.getTenantData(req.tenantId);
  data.portfolio = portfolio;
  store.save();
  res.json(data.portfolio);
});

router.delete('/units/:unitId', (req, res) => {
  const { unitId } = req.params;
  const data = store.getTenantData(req.tenantId);
  data.portfolio = data.portfolio
    .map((g) => ({ ...g, units: g.units.filter((u) => u.id !== unitId) }))
    .filter((g) => g.units.length > 0 || !g.isMerge);
  data.bookings = data.bookings.filter((b) => b.unitId !== unitId);
  data.channelMappings = data.channelMappings.filter((m) => m.unitId !== unitId);
  data.icalConnections = data.icalConnections.filter((i) => i.unitId !== unitId);
  store.save();
  res.json({ ok: true });
});

export default router;
