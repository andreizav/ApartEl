import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  res.json(data.inventory);
});

router.put('/', (req, res) => {
  const inventory = req.body;
  if (!Array.isArray(inventory)) return res.status(400).json({ error: 'inventory must be an array' });
  const data = store.getTenantData(req.tenantId);
  data.inventory = inventory;
  store.save();
  res.json(data.inventory);
});

export default router;
