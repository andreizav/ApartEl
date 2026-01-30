import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

function prevDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function seed() {
  const tenant = {
    id: 't-demo',
    name: 'Demo Hospitality Group',
    plan: 'Pro',
    status: 'Active',
    maxUnits: 100,
    features: { staffBot: true, multiCalendar: true, reports: true },
  };
  const staff = [
    { id: 's1', tenantId: 't-demo', name: 'Alice Admin', role: 'Manager', email: 'alice@demo.com', phone: '+1234567890', avatar: 'https://picsum.photos/seed/alice/100/100', status: 'Active', messages: [], unreadCount: 0, online: true, lastActive: new Date().toISOString() },
    { id: 's2', tenantId: 't-demo', name: 'Bob Cleaner', role: 'Cleaner', email: 'bob@demo.com', phone: '+1987654321', avatar: 'https://picsum.photos/seed/bob/100/100', status: 'Active', messages: [], unreadCount: 0, online: false, lastActive: prevDate(1).toISOString() },
  ];
  const portfolio = [
    {
      id: 'g1', name: 'Downtown Collection', expanded: true, isMerge: false, units: [
        { id: 'u1', name: 'Loft 101', internalName: 'Loft 101', officialAddress: '123 Main St', basePrice: 150, cleaningFee: 50, wifiSsid: 'Guest_WiFi', wifiPassword: 'pass', accessCodes: '1234', status: 'Active', assignedCleanerId: 's2' },
        { id: 'u2', name: 'Loft 102', internalName: 'Loft 102', officialAddress: '123 Main St', basePrice: 160, cleaningFee: 50, wifiSsid: 'Guest_WiFi', wifiPassword: 'pass', accessCodes: '5678', status: 'Active' },
        { id: 'u3', name: 'Penthouse', internalName: 'PH', officialAddress: '123 Main St', basePrice: 350, cleaningFee: 100, wifiSsid: 'PH_WiFi', wifiPassword: 'secure', accessCodes: '9999', status: 'Active' },
      ]
    },
    {
      id: 'g2', name: 'Seaside Villas', expanded: true, isMerge: false, units: [
        { id: 'u4', name: 'Villa A', internalName: 'Villa A', officialAddress: 'Ocean Dr', basePrice: 500, cleaningFee: 150, wifiSsid: 'Sea_Net', wifiPassword: 'wave', accessCodes: '0000', status: 'Active' },
      ]
    },
  ];
  const clients = [
    { phoneNumber: '+1555010101', name: 'John Doe', email: 'john@test.com', address: 'NY', country: 'USA', avatar: 'https://picsum.photos/seed/john/100/100', platform: 'whatsapp', status: 'Replied', lastActive: new Date().toISOString(), createdAt: prevDate(30).toISOString(), unreadCount: 0, online: true, previousBookings: 2, messages: [{ id: 'm1', text: 'Hi there!', sender: 'client', timestamp: prevDate(0).toISOString(), platform: 'whatsapp' }] },
    { phoneNumber: '+1555020202', name: 'Jane Smith', email: 'jane@test.com', address: 'London', country: 'UK', avatar: 'https://picsum.photos/seed/jane/100/100', platform: 'telegram', status: 'New', lastActive: prevDate(2).toISOString(), createdAt: prevDate(5).toISOString(), unreadCount: 1, online: false, previousBookings: 0, messages: [{ id: 'm2', text: 'Is the pool open?', sender: 'client', timestamp: prevDate(2).toISOString(), platform: 'telegram' }] },
  ];
  const bookings = [
    { id: 'b1', unitId: 'u1', guestName: 'John Doe', guestPhone: '+1555010101', startDate: prevDate(10).toISOString(), endDate: prevDate(7).toISOString(), source: 'airbnb', status: 'confirmed', price: 450, createdAt: prevDate(30).toISOString(), assignedCleanerId: 's2' },
    { id: 'b2', unitId: 'u2', guestName: 'Current Guest', guestPhone: '', startDate: prevDate(1).toISOString(), endDate: prevDate(-2).toISOString(), source: 'booking', status: 'confirmed', price: 480, createdAt: prevDate(5).toISOString() },
    { id: 'b3', unitId: 'u3', guestName: 'Future VIP', guestPhone: '', startDate: prevDate(-5).toISOString(), endDate: prevDate(-10).toISOString(), source: 'direct', status: 'confirmed', price: 1750, createdAt: prevDate(2).toISOString() },
  ];
  const transactions = [
    { id: 'tx1', tenantId: 't-demo', date: prevDate(2).toISOString().split('T')[0], property: 'Loft 101', category: 'Rent_Income', subCategory: 'Short Term', description: 'Airbnb Payout', amount: 450, currency: 'USD', type: 'income' },
    { id: 'tx2', date: prevDate(1).toISOString().split('T')[0], property: 'Loft 101', category: 'Cleaning', subCategory: 'Cleaning Service', description: 'Cleaning', amount: 50, currency: 'USD', type: 'expense' },
  ];
  const inventory = [
    { id: 'ic1', name: 'Toiletries', items: [{ id: 'i1', name: 'Shampoo (50ml)', quantity: 45 }, { id: 'i2', name: 'Soap Bar', quantity: 30 }] },
    { id: 'ic2', name: 'Linens', items: [{ id: 'i3', name: 'Towel (Bath)', quantity: 20 }, { id: 'i4', name: 'Duvet Cover', quantity: 10 }] },
    { id: 'ic3', name: 'Kitchen', items: [{ id: 'i5', name: 'Coffee Pods', quantity: 100 }, { id: 'i6', name: 'Tea Bags', quantity: 50 }] },
  ];
  const channelMappings = [
    { id: 'cm1', unitId: 'u1', unitName: 'Loft 101', groupName: 'Downtown Collection', airbnbId: '18239012', bookingId: '98321_01', markup: 15, isMapped: true, status: 'Active' },
    { id: 'cm2', unitId: 'u2', unitName: 'Loft 102', groupName: 'Downtown Collection', airbnbId: '', bookingId: '98321_02', markup: 0, isMapped: false, status: 'Inactive' },
    { id: 'cm3', unitId: 'u3', unitName: 'Penthouse', groupName: 'Downtown Collection', airbnbId: '', bookingId: '', markup: 0, isMapped: false, status: 'Inactive' },
    { id: 'cm4', unitId: 'u4', unitName: 'Villa A', groupName: 'Seaside Villas', airbnbId: '', bookingId: '', markup: 0, isMapped: false, status: 'Inactive' },
  ];
  const icalConnections = [
    { id: 'ical1', unitId: 'u3', unitName: 'Penthouse', importUrl: 'https://airbnb.com/calendar/ical/...', exportUrl: 'https://api.apartel.app/cal/t-demo/u3.ics', lastSync: '10 mins ago' },
    { id: 'ical2', unitId: 'u1', unitName: 'Loft 101', importUrl: '', exportUrl: 'https://api.apartel.app/cal/t-demo/u1.ics', lastSync: 'Never' },
    { id: 'ical3', unitId: 'u2', unitName: 'Loft 102', importUrl: '', exportUrl: 'https://api.apartel.app/cal/t-demo/u2.ics', lastSync: 'Never' },
    { id: 'ical4', unitId: 'u4', unitName: 'Villa A', importUrl: '', exportUrl: 'https://api.apartel.app/cal/t-demo/u4.ics', lastSync: 'Never' },
  ];
  const otaConfigs = {
    airbnb: { isEnabled: true, clientId: 'ab_12345', clientSecret: '******' },
    booking: { isEnabled: true, hotelId: '987654', username: 'xml_user' },
    expedia: { isEnabled: false },
  };
  const appSettings = {
    waStatus: 'connected',
    autoDraft: false,
    tgBotToken: '123:ABC...',
    tgAdminGroupId: '-100123',
    aiApiKey: 'AIza...',
    aiSystemPrompt: 'You are an elite concierge.',
    ragSensitivity: 0.8,
  };

  return {
    tenants: [tenant],
    staff,
    dataByTenant: {
      't-demo': {
        portfolio,
        bookings,
        clients,
        transactions,
        inventory,
        channelMappings,
        icalConnections,
        otaConfigs,
        appSettings,
      },
    },
  };
}

let state = null;

function load() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    state = JSON.parse(raw);
    return state;
  } catch (e) {
    if (e.code === 'ENOENT') {
      state = seed();
      save();
      return state;
    }
    throw e;
  }
}

function save() {
  if (!state) return;
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function getState() {
  if (!state) load();
  return state;
}

function getTenantData(tenantId) {
  const s = getState();
  if (!s.dataByTenant[tenantId]) {
    s.dataByTenant[tenantId] = {
      portfolio: [],
      bookings: [],
      clients: [],
      transactions: [],
      inventory: [],
      channelMappings: [],
      icalConnections: [],
      otaConfigs: { airbnb: { isEnabled: false }, booking: { isEnabled: false }, expedia: { isEnabled: false } },
      appSettings: { waStatus: 'disconnected', autoDraft: true, tgBotToken: '', tgAdminGroupId: '', aiApiKey: '', aiSystemPrompt: 'You are a helpful property manager.', ragSensitivity: 0.7 },
    };
  }
  return s.dataByTenant[tenantId];
}

function clearTenant(tenantId) {
  const s = getState();
  if (s.dataByTenant[tenantId]) {
    // Clear all arrays
    s.dataByTenant[tenantId].portfolio = [];
    s.dataByTenant[tenantId].bookings = [];
    s.dataByTenant[tenantId].clients = [];
    s.dataByTenant[tenantId].transactions = [];
    s.dataByTenant[tenantId].inventory = [];
    s.dataByTenant[tenantId].channelMappings = [];
    s.dataByTenant[tenantId].icalConnections = [];
    save();
  }
}

function resetTenant(tenantId) {
  const s = getState();
  // Generate fresh seed data
  const output = seed();
  // Use the demo tenant data as a template
  const template = output.dataByTenant['t-demo'];

  // Overwrite the target tenant's data with the template
  s.dataByTenant[tenantId] = JSON.parse(JSON.stringify(template));
  save();
}

export default { load, save, getState, getTenantData, seed, clearTenant, resetTenant };
export { load, save, getState, getTenantData, seed, clearTenant, resetTenant };
