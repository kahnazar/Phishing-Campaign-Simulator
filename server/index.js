require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { randomUUID, scryptSync, timingSafeEqual, createHmac } = require('crypto');
const { sendTestEmail, getSmtpStatus } = require('./email');
const { getSmtpConfigForClient, updateSmtpConfig } = require('./config-store');
const {
  normalizeRecipientInput,
  upsertRecipientsInDb,
  parseCsvRecipients,
  parseDirectoryText,
  summarizeImportResult,
  resolveGoogleSheetCsvUrl,
  ensureRecipientsArray,
  createRecipientRecord,
} = require('./recipients-service');

const app = express();
const PORT = process.env.PORT || 4000;

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const BUILD_PATH = path.join(__dirname, '..', 'build');
const JWT_SECRET = process.env.JWT_SECRET || 'phishlab-dev-secret';
const TOKEN_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours
const DEFAULT_ADMIN_PASSWORD_HASH =
  '1ea3c2df21ea67caddefca19ac8a3fd6:de74239e331c11bb4a24c4a4f1b226ad7f48fa401e42329064586d01f3a50b7711c3b6c8da38ebcc40ce49708b60a148faa0212d3a9e0d52852c470bca9fc3c5';
const DEFAULT_ADMIN_USER = {
  id: 'admin-1',
  email: 'admin@company.com',
  name: 'Alex Rivera',
  role: 'Admin',
  passwordHash: DEFAULT_ADMIN_PASSWORD_HASH
};

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function ensureDatabase() {
  const seedData = {
    campaigns: [],
    templates: [],
    recipients: [],
    teamMembers: [],
    users: [DEFAULT_ADMIN_USER]
  };

  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2));
    return;
  }

  try {
    const current = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    let changed = false;

    for (const key of ['campaigns', 'templates', 'recipients', 'teamMembers']) {
      if (!Array.isArray(current[key])) {
        current[key] = [];
        changed = true;
      }
    }

    if (!Array.isArray(current.users)) {
      current.users = [DEFAULT_ADMIN_USER];
      changed = true;
    } else if (!current.users.some((user) => user.email === DEFAULT_ADMIN_USER.email)) {
      current.users.push({ ...DEFAULT_ADMIN_USER });
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(DB_PATH, JSON.stringify(current, null, 2));
    }
  } catch (error) {
    console.error('Failed to read database, recreating seed file.', error);
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2));
  }
}

async function readDb() {
  ensureDatabase();
  const raw = await fsp.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(data) {
  await fsp.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { passwordHash, ...safe } = user;
  return safe;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }

  const [salt, key] = storedHash.split(':');
  if (!salt || !key) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');

  if (derived.length !== keyBuffer.length) {
    return false;
  }

  return timingSafeEqual(derived, keyBuffer);
}

function createToken(payload) {
  const issuedAt = Date.now();
  const body = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + TOKEN_EXPIRY_MS,
  };

  const headerSegment = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadSegment = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = createHmac('sha256', JWT_SECRET)
    .update(`${headerSegment}.${payloadSegment}`)
    .digest('base64url');

  return `${headerSegment}.${payloadSegment}.${signature}`;
}

function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerSegment, payloadSegment, signature] = parts;
  const expectedSignature = createHmac('sha256', JWT_SECRET)
    .update(`${headerSegment}.${payloadSegment}`)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf-8'));
  if (payload.exp && Date.now() > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}

async function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    const error = new Error('Missing authorization header');
    error.status = 401;
    throw error;
  }

  const token = authHeader.slice(7).trim();
  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    const authError = new Error('Invalid or expired token');
    authError.status = 401;
    throw authError;
  }

  const db = await readDb();
  const user = db.users?.find((item) => item.id === payload.sub);

  if (!user) {
    const authError = new Error('User not found');
    authError.status = 401;
    throw authError;
  }

  return sanitizeUser(user);
}

async function authenticate(req, res, next) {
  try {
    const user = await authenticateRequest(req);
    req.user = user;
    next();
  } catch (error) {
    const status = error.status || 401;
    res.status(status).json({ message: error.message || 'Unauthorized' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || (!roles.includes(req.user.role) && !roles.includes('*'))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

function syncUserWithTeam(db, updatedMember) {
  if (!db.users || !updatedMember) {
    return;
  }
  const userIndex = db.users.findIndex(
    (user) => user.id === updatedMember.id || user.email.toLowerCase() === updatedMember.email.toLowerCase()
  );
  if (userIndex !== -1) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      email: updatedMember.email,
      name: updatedMember.name,
      role: updatedMember.role,
    };
  }
}

function mapCampaignPayload(payload, templateName) {
  const now = new Date();
  const recipientCount = Number(payload.recipientCount) || 0;
  const sendTime = payload.sendTime === 'scheduled' ? 'scheduled' : 'immediate';
  return {
    id: randomUUID(),
    name: payload.name,
    description: payload.description || '',
    status: sendTime === 'immediate' ? 'running' : 'scheduled',
    templateId: payload.templateId,
    template: templateName,
    recipients: recipientCount,
    sent: sendTime === 'immediate' ? recipientCount : 0,
    opened: 0,
    clicked: 0,
    submitted: 0,
    createdAt: now.toISOString(),
    scheduledAt: sendTime === 'scheduled' && payload.scheduleDate ? new Date(payload.scheduleDate).toISOString() : undefined
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const db = await readDb();
    const user = db.users?.find((item) => item.email.toLowerCase() === email.toLowerCase());

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json(req.user);
});

app.get('/api/email/status', authenticate, requireRole('Admin'), (_req, res) => {
  res.json(getSmtpStatus());
});

app.post('/api/email/test', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const { to, subject, message } = req.body || {};
    if (!to) {
      return res.status(400).json({ message: 'Recipient email address (to) is required' });
    }

    const info = await sendTestEmail({ to, subject, message });
    res.json({
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (error) {
    console.error('SMTP test failed', error);
    const message = error instanceof Error ? error.message : 'Failed to send test email';
    const status = /environment variable|Recipient email address/.test(message) ? 400 : 502;
    res.status(status).json({ message });
  }
});

app.get('/api/email/config', authenticate, requireRole('Admin'), (_req, res) => {
  res.json(getSmtpConfigForClient());
});

app.put('/api/email/config', authenticate, requireRole('Admin'), async (req, res) => {
  try {
    const { host, port, secure, user, pass, from } = req.body || {};
    const updated = updateSmtpConfig({ host, port, secure, user, pass, from });
    res.json(updated);
  } catch (error) {
    console.error('Failed to update SMTP config', error);
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update SMTP configuration' });
  }
});

app.get('/api/templates', authenticate, async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.templates);
  } catch (error) {
    next(error);
  }
});

app.get('/api/templates/:id', authenticate, async (req, res, next) => {
  try {
    const db = await readDb();
    const template = db.templates.find((item) => item.id === req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
});

app.get('/api/campaigns', authenticate, async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.campaigns);
  } catch (error) {
    next(error);
  }
});

app.post('/api/campaigns', authenticate, requireRole('Admin', 'Manager'), async (req, res, next) => {
  try {
    const { name, templateId, recipientCount } = req.body;
    if (!name || !templateId || !recipientCount) {
      return res.status(400).json({ message: 'name, templateId and recipientCount are required' });
    }

    const db = await readDb();
    const template = db.templates.find((item) => item.id === templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const newCampaign = mapCampaignPayload(req.body, template.name);
    db.campaigns.push(newCampaign);
    await writeDb(db);

    res.status(201).json(newCampaign);
  } catch (error) {
    next(error);
  }
});

app.put('/api/campaigns/:id', authenticate, requireRole('Admin', 'Manager'), async (req, res, next) => {
  try {
    const db = await readDb();
    const idx = db.campaigns.findIndex((item) => item.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const existing = db.campaigns[idx];
    const updated = { ...existing, ...req.body, id: existing.id };
    db.campaigns[idx] = updated;
    await writeDb(db);

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/campaigns/:id', authenticate, requireRole('Admin'), async (req, res, next) => {
  try {
    const db = await readDb();
    const nextCampaigns = db.campaigns.filter((item) => item.id !== req.params.id);
    if (nextCampaigns.length === db.campaigns.length) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    db.campaigns = nextCampaigns;
    await writeDb(db);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/recipients', authenticate, async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.recipients);
  } catch (error) {
    next(error);
  }
});

app.post('/api/recipients', authenticate, requireRole('Admin'), async (req, res, next) => {
  try {
    const normalized = normalizeRecipientInput(req.body);
    if (!normalized) {
      return res.status(400).json({ message: 'Valid name and email are required' });
    }

    const db = await readDb();
    ensureRecipientsArray(db);

    const exists = db.recipients.some(
      (recipient) => recipient.email.toLowerCase() === normalized.email
    );
    if (exists) {
      return res.status(409).json({ message: 'Recipient with this email already exists' });
    }

    const record = createRecipientRecord(normalized);
    db.recipients.push(record);

    await writeDb(db);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

app.post('/api/recipients/import/csv', authenticate, requireRole('Admin'), async (req, res, next) => {
  try {
    const { csv, updateExisting = true } = req.body || {};
    if (!csv || typeof csv !== 'string') {
      return res.status(400).json({ message: 'CSV content is required' });
    }

    let normalized;
    try {
      normalized = parseCsvRecipients(csv);
    } catch (error) {
      console.error('Failed to parse CSV import', error);
      return res.status(400).json({ message: 'Unable to parse CSV data' });
    }

    if (!normalized.length) {
      return res.status(400).json({ message: 'No valid recipient rows found in CSV' });
    }

    const db = await readDb();
    const result = upsertRecipientsInDb(db, normalized, { updateExisting: Boolean(updateExisting) });
    await writeDb(db);

    res.json({
      source: 'csv',
      ...summarizeImportResult(result),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/recipients/import/google', authenticate, requireRole('Admin'), async (req, res, next) => {
  try {
    const { sheetUrl, updateExisting = true } = req.body || {};
    const csvUrl = resolveGoogleSheetCsvUrl(sheetUrl);
    if (!csvUrl) {
      return res.status(400).json({ message: 'Provide a valid Google Sheets share link' });
    }

    let csvText;
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) {
        const message = response.status === 403 ? 'Google Sheet is not publicly accessible' : 'Failed to download Google Sheet';
        return res.status(400).json({ message });
      }
      csvText = await response.text();
    } catch (error) {
      console.error('Failed to fetch Google Sheet CSV', error);
      return res.status(400).json({ message: 'Unable to fetch Google Sheet. Ensure it is shared publicly.' });
    }

    let normalized;
    try {
      normalized = parseCsvRecipients(csvText);
    } catch (error) {
      console.error('Failed to parse Google Sheet CSV', error);
      return res.status(400).json({ message: 'Unable to parse data from Google Sheet' });
    }

    if (!normalized.length) {
      return res.status(400).json({ message: 'Google Sheet did not contain any valid rows' });
    }

    const db = await readDb();
    const result = upsertRecipientsInDb(db, normalized, { updateExisting: Boolean(updateExisting) });
    await writeDb(db);

    res.json({
      source: 'google_sheets',
      csvUrl,
      ...summarizeImportResult(result),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/recipients/import/directory', authenticate, requireRole('Admin'), async (req, res, next) => {
  try {
    const { entries, text, updateExisting = true } = req.body || {};

    const normalizedFromText = typeof text === 'string' ? parseDirectoryText(text) : [];
    const normalizedFromEntries = Array.isArray(entries)
      ? entries
          .map((entry) => normalizeRecipientInput(entry))
          .filter((item) => item && item.email)
      : [];

    const combined = [...normalizedFromText, ...normalizedFromEntries];
    if (!combined.length) {
      return res.status(400).json({ message: 'No valid directory entries provided' });
    }

    const db = await readDb();
    const result = upsertRecipientsInDb(db, combined, { updateExisting: Boolean(updateExisting) });
    await writeDb(db);

    res.json({
      source: 'directory',
      ...summarizeImportResult(result),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/team', authenticate, async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.teamMembers);
  } catch (error) {
    next(error);
  }
});

app.post('/api/team', authenticate, requireRole('Admin'), async (req, res, next) => {
  try {
    const { email, role, name } = req.body;
    if (!email || !role) {
      return res.status(400).json({ message: 'email and role are required' });
    }

    const derivedName =
      name ||
      email
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const db = await readDb();
    const newMember = {
      id: randomUUID(),
      name: derivedName,
      email,
      role,
      campaigns: 0,
      lastActive: 'Just now'
    };

    db.teamMembers.push(newMember);
    await writeDb(db);

    res.status(201).json(newMember);
  } catch (error) {
    next(error);
  }
});

app.put('/api/team/:id', authenticate, requireRole('Admin'), async (req, res, next) => {
  try {
    const db = await readDb();
    const index = db.teamMembers.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    const existing = db.teamMembers[index];
    const updated = { ...existing, ...req.body, id: existing.id };
    db.teamMembers[index] = updated;
    syncUserWithTeam(db, updated);
    await writeDb(db);

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/team/:id', authenticate, requireRole('Admin'), async (req, res, next) => {
  try {
    const db = await readDb();
    const nextMembers = db.teamMembers.filter((item) => item.id !== req.params.id);
    if (nextMembers.length === db.teamMembers.length) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    db.teamMembers = nextMembers;
    await writeDb(db);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/stats', authenticate, async (_req, res, next) => {
  try {
    const db = await readDb();
    const totalRecipients = db.campaigns.reduce((sum, campaign) => sum + (campaign.recipients || 0), 0);
    const totalSent = db.campaigns.reduce((sum, campaign) => sum + (campaign.sent || 0), 0);
    const totalOpened = db.campaigns.reduce((sum, campaign) => sum + (campaign.opened || 0), 0);
    const totalClicked = db.campaigns.reduce((sum, campaign) => sum + (campaign.clicked || 0), 0);
    const totalSubmitted = db.campaigns.reduce((sum, campaign) => sum + (campaign.submitted || 0), 0);

    res.json({ totalRecipients, totalSent, totalOpened, totalClicked, totalSubmitted });
  } catch (error) {
    next(error);
  }
});

if (fs.existsSync(BUILD_PATH)) {
  app.use(express.static(BUILD_PATH));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(BUILD_PATH, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
