import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { findAllRecipients, createRecipient, findRecipientByEmail, updateRecipient } from '../services/recipientService';
import { mapRecipient } from '../services/mappers';
import {
  normalizeRecipientInput,
  parseCsvRecipients,
  parseDirectoryText,
  resolveGoogleSheetCsvUrl,
} from '../services/recipientParserService';

const recipientRouter = Router();

recipientRouter.use(authenticate);

recipientRouter.get('/', async (_req, res, next) => {
  try {
    const recipients = await findAllRecipients();
    res.json(recipients.map(mapRecipient));
  } catch (error) {
    next(error);
  }
});

recipientRouter.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const normalized = normalizeRecipientInput(req.body);
    if (!normalized) {
      return res.status(400).json({ message: 'Valid name and email are required' });
    }

    const existing = await findRecipientByEmail(normalized.email);

    if (existing) {
      return res.status(409).json({ message: 'Recipient with this email already exists' });
    }

    const recipient = await createRecipient(normalized);

    res.status(201).json(mapRecipient(recipient));
  } catch (error) {
    next(error);
  }
});

recipientRouter.post('/import/csv', requireRole('ADMIN'), async (req, res, next) => {
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

    const added: any[] = [];
    const updated: any[] = [];
    const skipped: Array<{ email: string; reason: string }> = [];
    const seen = new Set<string>();

    for (const item of normalized) {
      if (!item || !item.email) {
        continue;
      }

      if (seen.has(item.email)) {
        skipped.push({ email: item.email, reason: 'duplicate_in_upload' });
        continue;
      }
      seen.add(item.email);

      const existing = await findRecipientByEmail(item.email);
      if (!existing) {
        const recipient = await createRecipient(item);
        added.push(recipient);
      } else if (updateExisting) {
        const recipient = await updateRecipient(existing.id, item);
        updated.push(recipient);
      } else {
        skipped.push({ email: item.email, reason: 'exists' });
      }
    }

    res.json({
      source: 'csv',
      added: added.length,
      updated: updated.length,
      skipped,
      total: added.length + updated.length,
    });
  } catch (error) {
    next(error);
  }
});

recipientRouter.post('/import/google', requireRole('ADMIN'), async (req, res, next) => {
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

    const added: any[] = [];
    const updated: any[] = [];
    const skipped: Array<{ email: string; reason: string }> = [];
    const seen = new Set<string>();

    for (const item of normalized) {
      if (!item || !item.email) {
        continue;
      }

      if (seen.has(item.email)) {
        skipped.push({ email: item.email, reason: 'duplicate_in_upload' });
        continue;
      }
      seen.add(item.email);

      const existing = await findRecipientByEmail(item.email);
      if (!existing) {
        const recipient = await createRecipient(item);
        added.push(recipient);
      } else if (updateExisting) {
        const recipient = await updateRecipient(existing.id, item);
        updated.push(recipient);
      } else {
        skipped.push({ email: item.email, reason: 'exists' });
      }
    }

    res.json({
      source: 'google_sheets',
      csvUrl,
      added: added.length,
      updated: updated.length,
      skipped,
      total: added.length + updated.length,
    });
  } catch (error) {
    next(error);
  }
});

recipientRouter.post('/import/directory', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { entries, text, updateExisting = true } = req.body || {};

    const normalizedFromText = typeof text === 'string' ? parseDirectoryText(text) : [];
    const normalizedFromEntries = Array.isArray(entries)
      ? entries
          .map((entry) => normalizeRecipientInput(entry))
          .filter((item): item is NonNullable<typeof item> => item !== null && !!item.email)
      : [];

    const combined = [...normalizedFromText, ...normalizedFromEntries];
    if (!combined.length) {
      return res.status(400).json({ message: 'No valid directory entries provided' });
    }

    const added: any[] = [];
    const updated: any[] = [];
    const skipped: Array<{ email: string; reason: string }> = [];
    const seen = new Set<string>();

    for (const item of combined) {
      if (!item || !item.email) {
        continue;
      }

      if (seen.has(item.email)) {
        skipped.push({ email: item.email, reason: 'duplicate_in_upload' });
        continue;
      }
      seen.add(item.email);

      const existing = await findRecipientByEmail(item.email);
      if (!existing) {
        const recipient = await createRecipient(item);
        added.push(recipient);
      } else if (updateExisting) {
        const recipient = await updateRecipient(existing.id, item);
        updated.push(recipient);
      } else {
        skipped.push({ email: item.email, reason: 'exists' });
      }
    }

    res.json({
      source: 'directory',
      added: added.length,
      updated: updated.length,
      skipped,
      total: added.length + updated.length,
    });
  } catch (error) {
    next(error);
  }
});

export default recipientRouter;

