import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const state = store.getState();
  const list = state.staff.filter((s) => s.tenantId === req.tenantId);
  res.json(list);
});

router.post('/', (req, res) => {
  const member = req.body;
  if (!member?.email) return res.status(400).json({ error: 'email required' });
  const state = store.getState();
  if (state.staff.some((s) => s.email.toLowerCase() === member.email.toLowerCase())) {
    return res.status(409).json({ error: 'Staff with this email already exists' });
  }
  const newMember = {
    id: member.id || `u-${Date.now()}`,
    tenantId: req.tenantId,
    name: member.name ?? member.email.split('@')[0],
    role: member.role ?? 'Staff',
    email: member.email,
    phone: member.phone ?? '',
    avatar: member.avatar ?? `https://picsum.photos/seed/${Date.now()}/100/100`,
    status: member.status ?? 'Active',
    messages: member.messages ?? [],
    unreadCount: member.unreadCount ?? 0,
    online: false,
    lastActive: new Date().toISOString(),
  };
  state.staff.push(newMember);
  store.save();
  res.json(newMember);
});

router.patch('/:id', (req, res) => {
  const state = store.getState();
  const idx = state.staff.findIndex((s) => s.id === req.params.id && s.tenantId === req.tenantId);
  if (idx < 0) return res.status(404).json({ error: 'Staff not found' });
  const { id, tenantId, ...rest } = req.body;
  state.staff[idx] = { ...state.staff[idx], ...rest };
  store.save();
  res.json(state.staff[idx]);
});

router.delete('/:id', (req, res) => {
  const state = store.getState();
  const idx = state.staff.findIndex((s) => s.id === req.params.id && s.tenantId === req.tenantId);
  if (idx < 0) return res.status(404).json({ error: 'Staff not found' });
  state.staff.splice(idx, 1);
  store.save();
  res.json({ ok: true });
});

export default router;
