const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const BUILD_PATH = path.join(__dirname, '..', 'build');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function ensureDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    const seedPath = path.join(__dirname, 'data', 'db.json');
    const seedData = {
      campaigns: [],
      templates: [],
      recipients: [],
      teamMembers: []
    };
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2));
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

app.get('/api/templates', async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.templates);
  } catch (error) {
    next(error);
  }
});

app.get('/api/templates/:id', async (req, res, next) => {
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

app.get('/api/campaigns', async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.campaigns);
  } catch (error) {
    next(error);
  }
});

app.post('/api/campaigns', async (req, res, next) => {
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

app.put('/api/campaigns/:id', async (req, res, next) => {
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

app.delete('/api/campaigns/:id', async (req, res, next) => {
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

app.get('/api/recipients', async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.recipients);
  } catch (error) {
    next(error);
  }
});

app.get('/api/team', async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.teamMembers);
  } catch (error) {
    next(error);
  }
});

app.post('/api/team', async (req, res, next) => {
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

app.put('/api/team/:id', async (req, res, next) => {
  try {
    const db = await readDb();
    const index = db.teamMembers.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    const existing = db.teamMembers[index];
    const updated = { ...existing, ...req.body, id: existing.id };
    db.teamMembers[index] = updated;
    await writeDb(db);

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/team/:id', async (req, res, next) => {
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

app.get('/api/stats', async (_req, res, next) => {
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
