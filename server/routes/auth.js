import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import store from '../store.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

function createToken(user) {
  return jwt.sign(
    { userId: user.id, tenantId: user.tenantId, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email required' });
  }
  const state = store.getState();
  const user = state.staff.find((s) => s.email.toLowerCase() === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }
  const token = createToken(user);
  const tenant = state.tenants.find((t) => t.id === user.tenantId);
  res.json({
    success: true,
    token,
    user: { ...user, lastActive: new Date().toISOString(), online: true },
    tenant: tenant || null,
  });
});

router.post('/register', (req, res) => {
  const { orgName, email } = req.body || {};
  if (!orgName || !email) {
    return res.status(400).json({ error: 'orgName and email required' });
  }
  const state = store.getState();
  if (state.staff.some((s) => s.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const tenantId = `t-${Date.now()}`;
  const tenant = {
    id: tenantId,
    name: String(orgName),
    plan: 'Free',
    status: 'Active',
    maxUnits: 1,
    features: { staffBot: false, multiCalendar: true, reports: false },
  };
  const userId = `u-${Date.now()}`;
  const user = {
    id: userId,
    tenantId,
    name: String(email).split('@')[0],
    role: 'Manager',
    email: String(email),
    phone: '',
    avatar: `https://picsum.photos/seed/${userId}/100/100`,
    status: 'Active',
    messages: [],
    unreadCount: 0,
    online: true,
    lastActive: new Date().toISOString(),
  };
  state.tenants.push(tenant);
  state.staff.push(user);
  store.getTenantData(tenantId);
  store.save();
  const token = createToken(user);
  res.json({
    success: true,
    token,
    user,
    tenant,
  });
});

router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.body?.token;
  if (token) {
    try {
      const decoded = jwt.decode(token);
      const state = store.getState();
      const idx = state.staff.findIndex((s) => s.id === decoded?.userId);
      if (idx >= 0) {
        state.staff[idx] = { ...state.staff[idx], online: false };
        store.save();
      }
    } catch (_) {}
  }
  res.json({ success: true });
});

export default router;
