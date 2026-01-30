import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  res.json(data.appSettings);
});

router.put('/', (req, res) => {
  const settings = req.body;
  if (typeof settings !== 'object') return res.status(400).json({ error: 'appSettings must be an object' });
  const data = store.getTenantData(req.tenantId);
  data.appSettings = { ...data.appSettings, ...settings };
  store.save();
  res.json(data.appSettings);
});

export default router;
