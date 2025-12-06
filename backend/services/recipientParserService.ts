import { parse } from 'csv-parse/sync';

function formatName(name: string | undefined, fallbackEmail: string): string {
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

function parseCampaigns(value: unknown): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) {
    return Math.round(numeric);
  }
  return 0;
}

function parseClickRate(value: unknown): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return Math.max(0, Math.min(1, value / 100));
  }
  const trimmed = String(value).trim();
  const numeric = Number(trimmed.replace('%', ''));
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(1, numeric / 100));
}

export function normalizeRecipientInput(input: any): {
  name: string;
  email: string;
  department: string;
  position: string;
  campaignCount: number;
  clickRate: number;
} | null {
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
    (input.givenName && input.familyName ? `${input.givenName} ${input.familyName}` : undefined);

  const department = (input.department || input.Department || input.orgUnit || 'General').toString().trim() || 'General';
  const position = (input.position || input.title || input.jobTitle || 'Employee').toString().trim() || 'Employee';

  const campaigns = parseCampaigns(input.campaigns ?? input.Campaigns ?? input.sentCount);
  const clickRate = parseClickRate(input.clickRate ?? input['click rate'] ?? input.click_percentage);

  return {
    name: formatName(name, email),
    email,
    department,
    position,
    campaignCount: campaigns,
    clickRate,
  };
}

export function parseCsvRecipients(csvText: string) {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records
    .map((record) => normalizeRecipientInput(record))
    .filter((item): item is NonNullable<typeof item> => item !== null && !!item.email);
}

export function parseDirectoryText(text: string) {
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
    .filter((item): item is NonNullable<typeof item> => item !== null && !!item.email);
}

export function resolveGoogleSheetCsvUrl(url: string | undefined): string | null {
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

