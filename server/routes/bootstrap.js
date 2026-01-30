import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.get('/', authMiddleware, (req, res) => {
  const data = store.getTenantData(req.tenantId);
  const state = store.getState();
  const staff = state.staff.filter((s) => s.tenantId === req.tenantId);
  res.json({
    user: req.user,
    tenant: req.tenant,
    portfolio: data.portfolio,
    bookings: data.bookings,
    clients: data.clients,
    staff,
    transactions: data.transactions,
    inventory: data.inventory,
    channelMappings: data.channelMappings,
    icalConnections: data.icalConnections,
    otaConfigs: data.otaConfigs,
    appSettings: data.appSettings,
  });
});

// Reset Data (Seed)
router.post('/reset', authMiddleware, (req, res) => {
  store.resetTenant(req.tenantId);
  res.json({ success: true, message: 'Data reset to seed values' });
});

// Clear Data (Delete All)
router.post('/clear', authMiddleware, (req, res) => {
  store.clearTenant(req.tenantId);
  res.json({ success: true, message: 'All data cleared' });
});

export default router;
