import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.use(authMiddleware);

router.get('/me', (req, res) => {
  res.json(req.tenant);
});

router.patch('/me', (req, res) => {
  const { plan, maxUnits, features } = req.body || {};
  const state = store.getState();
  const idx = state.tenants.findIndex((t) => t.id === req.tenantId);
  if (idx < 0) return res.status(404).json({ error: 'Tenant not found' });
  if (plan) state.tenants[idx].plan = plan;
  if (typeof maxUnits === 'number') state.tenants[idx].maxUnits = maxUnits;
  if (features && typeof features === 'object') state.tenants[idx].features = { ...state.tenants[idx].features, ...features };
  store.save();
  res.json(state.tenants[idx]);
});

export default router;
