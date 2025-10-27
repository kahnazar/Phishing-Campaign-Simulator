const { randomUUID } = require('crypto');
const { parse: parseCsvSync } = require('csv-parse/sync');

function ensureRecipientsArray(db) {
  if (!Array.isArray(db.recipients)) {
    db.recipients = [];
  }
}

function formatName(name, fallbackEmail) {
  if (name && typeof name === 'string' && name.trim()) {
    return name.trim();
  }
  if (!fallbackEmail) {
    return 'Recipient';
  }
  const localPart = fallbackEmail.split('@')[0] || fallbackEmail;
  return localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseCampaigns(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) {
    return Math.round(numeric);
  }
  return 0;
}

function formatClickRate(value) {
  if (value === undefined || value === null || value === '') {
    return '0%';
  }
  if (typeof value === 'number') {
    return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
  }
  const trimmed = String(value).trim();
  const numeric = Number(trimmed.replace('%', ''));
  if (!Number.isFinite(numeric)) {
    return '0%';
  }
  return `${Math.max(0, Math.min(100, Math.round(numeric)))}%`;
}

function normalizeRecipientInput(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const emailRaw =
    input.email ||
    input.Email ||
    input.mail ||
    input.primaryEmail ||
    input.username ||
    '';
  const email = String(emailRaw).trim().toLowerCase();
  if (!email) {
    return null;
  }

  const name =
    input.name ||
    input.fullName ||
    input.displayName ||
    input.givenName && input.familyName ? `${input.givenName} ${input.familyName}` : undefined;

  const department = (input.department || input.Department || input.orgUnit || 'General').toString().trim() || 'General';
  const position = (input.position || input.title || input.jobTitle || 'Employee').toString().trim() || 'Employee';

  const campaigns = parseCampaigns(input.campaigns ?? input.Campaigns ?? input.sentCount);
  const clickRate = formatClickRate(input.clickRate ?? input['click rate'] ?? input.click_percentage);

  return {
    name: formatName(name, email),
    email,
    department,
    position,
    campaigns,
    clickRate,
  };
}

function createRecipientRecord(normalized) {
  return {
    id: randomUUID(),
    ...normalized,
  };
}

function upsertRecipientsInDb(db, normalizedRecipients, options = {}) {
  const { updateExisting = true } = options;
  ensureRecipientsArray(db);

  const added = [];
  const updated = [];
  const skipped = [];

  const seen = new Set();

  for (const item of normalizedRecipients) {
    if (!item || !item.email) {
      continue;
    }

    if (seen.has(item.email)) {
      skipped.push({ email: item.email, reason: 'duplicate_in_upload' });
      continue;
    }
    seen.add(item.email);

    const existingIndex = db.recipients.findIndex(
      (recipient) => recipient.email.toLowerCase() === item.email
    );

    if (existingIndex === -1) {
      const record = createRecipientRecord(item);
      db.recipients.push(record);
      added.push(record);
    } else if (updateExisting) {
      const existing = db.recipients[existingIndex];
      const merged = {
        ...existing,
        ...item,
      };
      db.recipients[existingIndex] = merged;
      updated.push(merged);
    } else {
      skipped.push({ email: item.email, reason: 'exists' });
    }
  }

  return { added, updated, skipped };
}

function parseCsvRecipients(csvText) {
  const records = parseCsvSync(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records
    .map((record) => normalizeRecipientInput(record))
    .filter((item) => item && item.email);
}

function parseDirectoryText(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split(/[;,]/).map((part) => part.trim());
      return normalizeRecipientInput({
        name: parts[0],
        email: parts[1],
        department: parts[2],
        position: parts[3],
      });
    })
    .filter((item) => item && item.email);
}

function summarizeImportResult(result) {
  return {
    added: result.added.length,
    updated: result.updated.length,
    skipped: result.skipped,
    total: result.added.length + result.updated.length,
  };
}

function resolveGoogleSheetCsvUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();

  if (trimmed.includes('/export?format=csv')) {
    return trimmed;
  }

  const match = trimmed.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    return null;
  }

  const id = match[1];
  let gid = '0';

  const gidMatch = trimmed.match(/gid=([0-9]+)/);
  if (gidMatch) {
    gid = gidMatch[1];
  }

  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

module.exports = {
  normalizeRecipientInput,
  upsertRecipientsInDb,
  parseCsvRecipients,
  parseDirectoryText,
  summarizeImportResult,
  resolveGoogleSheetCsvUrl,
  ensureRecipientsArray,
  createRecipientRecord,
};
