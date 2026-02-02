import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import store from '../store.js';

const router = Router();
router.use(authMiddleware);

router.get('/mappings', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  res.json(data.channelMappings);
});

router.put('/mappings', (req, res) => {
  const list = req.body;
  if (!Array.isArray(list)) return res.status(400).json({ error: 'channelMappings must be an array' });
  const data = store.getTenantData(req.tenantId);
  data.channelMappings = list;
  store.save();
  res.json(data.channelMappings);
});

router.get('/ical', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  res.json(data.icalConnections);
});

router.put('/ical', (req, res) => {
  const list = req.body;
  if (!Array.isArray(list)) return res.status(400).json({ error: 'icalConnections must be an array' });
  const data = store.getTenantData(req.tenantId);
  data.icalConnections = list;
  store.save();
  res.json(data.icalConnections);
});

router.get('/ota', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  res.json(data.otaConfigs);
});

router.put('/ota', (req, res) => {
  const configs = req.body;
  if (typeof configs !== 'object') return res.status(400).json({ error: 'otaConfigs must be an object' });
  const data = store.getTenantData(req.tenantId);
  data.otaConfigs = { ...data.otaConfigs, ...configs };
  store.save();
  res.json(data.otaConfigs);
});

router.post('/sync', (req, res) => {
  const data = store.getTenantData(req.tenantId);
  const portfolio = data.portfolio || [];
  const allUnits = [];
  portfolio.forEach((g) => {
    (g.units || []).forEach((u) => allUnits.push({ unit: u, groupName: g.name }));
  });
  const currentMappings = data.channelMappings || [];
  const currentIcals = data.icalConnections || [];
  const updatedMappings = [];
  const updatedIcals = [];
  allUnits.forEach(({ unit, groupName }) => {
    const existingMap = currentMappings.find((m) => m.unitId === unit.id);
    updatedMappings.push(
      existingMap
        ? { ...existingMap, unitName: unit.name, groupName }
        : { id: `cm-${unit.id}`, unitId: unit.id, unitName: unit.name, groupName, airbnbId: '', bookingId: '', markup: 0, isMapped: false, status: 'Inactive' }
    );
    const existingIcal = currentIcals.find((i) => i.unitId === unit.id);
    const API_URL = process.env.API_PUBLIC_URL || 'http://localhost:4000';
    updatedIcals.push(
      existingIcal
        ? { ...existingIcal, unitName: unit.name }
        : { id: `ical-${unit.id}`, unitId: unit.id, unitName: unit.name, importUrl: '', exportUrl: `${API_URL}/cal/${req.tenantId}/${unit.id}.ics`, lastSync: 'Never' }
    );
  });
  data.channelMappings = updatedMappings;
  data.icalConnections = updatedIcals;
  store.save();
  res.json({ channelMappings: data.channelMappings, icalConnections: data.icalConnections });
});

export default router;
