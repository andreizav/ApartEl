import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  res.json(data.clients);
});

router.post('/', (req, res) => {
  const client = req.body;
  if (!client?.phoneNumber) return res.status(400).json({ error: 'phoneNumber required' });
  const data = store.getTenantData(req.tenantId);
  if (data.clients.some((c) => c.phoneNumber === client.phoneNumber)) {
    return res.status(409).json({ error: 'Client with this phone already exists' });
  }
  data.clients.push(client);
  store.save();
  res.json(client);
});

router.patch('/:phone', (req, res) => {
  const phone = decodeURIComponent(req.params.phone);
  const data = store.getTenantData(req.tenantId);
  const idx = data.clients.findIndex((c) => c.phoneNumber === phone);
  if (idx < 0) return res.status(404).json({ error: 'Client not found' });
  data.clients[idx] = { ...data.clients[idx], ...req.body, phoneNumber: data.clients[idx].phoneNumber };
  store.save();
  res.json(data.clients[idx]);
});

router.delete('/:phone', (req, res) => {
  const phone = decodeURIComponent(req.params.phone);
  const data = store.getTenantData(req.tenantId);
  const before = data.clients.length;
  data.clients = data.clients.filter((c) => c.phoneNumber !== phone);
  if (data.clients.length === before) return res.status(404).json({ error: 'Client not found' });
  store.save();
  res.json({ ok: true });
});

export default router;
