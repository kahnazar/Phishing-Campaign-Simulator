const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'data', 'config.json');

function ensureFile() {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({}, null, 2));
  }
}

function readConfig() {
  try {
    ensureFile();
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to read config.json', error);
    return {};
  }
}

function writeConfig(config) {
  ensureFile();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function coerceBoolean(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value === 'true' || value === '1';
  }
  return Boolean(value);
}

function coercePort(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const port = Number(value);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error('SMTP port must be a valid number');
  }
  return port;
}

function getSmtpConfig() {
  const config = readConfig();
  const smtp = config.smtp || {};
  return {
    host: smtp.host,
    port: typeof smtp.port === 'number' ? smtp.port : coercePort(smtp.port),
    secure: smtp.secure === undefined ? undefined : coerceBoolean(smtp.secure),
    user: smtp.user,
    pass: smtp.pass,
    from: smtp.from,
  };
}

function getSmtpConfigForClient() {
  const smtp = getSmtpConfig();
  return {
    host: smtp.host || '',
    port: smtp.port ?? '',
    secure: smtp.secure ?? false,
    user: smtp.user || '',
    from: smtp.from || '',
    hasPassword: Boolean(smtp.pass),
  };
}

function updateSmtpConfig(update) {
  const config = readConfig();
  const smtp = config.smtp || {};

  if (Object.prototype.hasOwnProperty.call(update, 'host')) {
    smtp.host = update.host ? String(update.host) : undefined;
  }
  if (Object.prototype.hasOwnProperty.call(update, 'port')) {
    smtp.port = coercePort(update.port);
  }
  if (Object.prototype.hasOwnProperty.call(update, 'secure')) {
    smtp.secure = coerceBoolean(update.secure) ?? false;
  }
  if (Object.prototype.hasOwnProperty.call(update, 'user')) {
    smtp.user = update.user ? String(update.user) : undefined;
  }
  if (Object.prototype.hasOwnProperty.call(update, 'pass')) {
    if (update.pass === '') {
      delete smtp.pass;
    } else if (typeof update.pass === 'string') {
      smtp.pass = update.pass;
    }
  }
  if (Object.prototype.hasOwnProperty.call(update, 'from')) {
    smtp.from = update.from ? String(update.from) : undefined;
  }

  config.smtp = smtp;
  writeConfig(config);
  return getSmtpConfigForClient();
}

module.exports = {
  getSmtpConfig,
  getSmtpConfigForClient,
  updateSmtpConfig,
};
