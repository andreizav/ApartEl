import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  res.json(data.transactions);
});

router.post('/', (req, res) => {
  const tx = req.body;
  const data = store.getTenantData(req.tenantId);
  const newTx = {
    id: tx.id || `tx-${Date.now()}`,
    tenantId: req.tenantId,
    date: tx.date,
    property: tx.property ?? '',
    category: tx.category ?? '',
    subCategory: tx.subCategory ?? '',
    description: tx.description ?? '',
    amount: tx.amount ?? 0,
    currency: tx.currency ?? 'USD',
    type: tx.type ?? 'expense',
  };
  data.transactions.unshift(newTx);
  store.save();
  res.json(newTx);
});

export default router;
