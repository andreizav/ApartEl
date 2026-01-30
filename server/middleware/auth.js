import jwt from 'jsonwebtoken';
import store from '../store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.body?.token || req.query?.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: token required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.tenantId = decoded.tenantId;
    req.email = decoded.email;
    const state = store.getState();
    const user = state.staff.find((s) => s.id === decoded.userId && s.tenantId === decoded.tenantId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    const tenant = state.tenants.find((t) => t.id === decoded.tenantId);
    req.tenant = tenant || null;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
