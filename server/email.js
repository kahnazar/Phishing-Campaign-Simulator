const nodemailer = require('nodemailer');
const { getSmtpConfig: getStoredSmtpConfig } = require('./config-store');

let cachedTransporter = null;
let cachedConfigSignature = null;

function parseBoolean(value) {
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

function assembleSmtpConfig() {
  const stored = getStoredSmtpConfig();
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  const host = SMTP_HOST || stored.host;
  const port = SMTP_PORT ? Number(SMTP_PORT) : stored.port ?? 587;
  const secureEnv = parseBoolean(SMTP_SECURE);
  const secure = secureEnv !== undefined ? secureEnv : (stored.secure !== undefined ? stored.secure : port === 465);
  const user = SMTP_USER || stored.user;
  const pass = SMTP_PASS || stored.pass;
  const from = SMTP_FROM || stored.from;

  const config = {
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    from,
  };

  const meta = {
    usingEnv: {
      host: Boolean(SMTP_HOST),
      port: Boolean(SMTP_PORT),
      secure: SMTP_SECURE !== undefined,
      user: Boolean(SMTP_USER),
      pass: Boolean(SMTP_PASS),
      from: Boolean(SMTP_FROM),
    },
    stored: {
      host: stored.host || null,
      port: stored.port || null,
      secure: stored.secure ?? null,
      user: stored.user || null,
      hasPassword: Boolean(stored.pass),
      from: stored.from || null,
    },
  };

  return { config, meta };
}

function validateConfig(config) {
  if (!config.host) {
    throw new Error('SMTP host is required (set via environment variables or UI)');
  }
  if (!config.from) {
    throw new Error('SMTP from address is required (set SMTP_FROM or configure in UI)');
  }
  if (config.auth && (!config.auth.user || !config.auth.pass)) {
    throw new Error('SMTP credentials are incomplete (username and password required)');
  }
}

async function getTransporter() {
  const { config } = assembleSmtpConfig();
  validateConfig(config);

  const signature = JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    hasAuth: Boolean(config.auth),
  });

  if (!cachedTransporter || cachedConfigSignature !== signature) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
    cachedConfigSignature = signature;
  }

  await cachedTransporter.verify();
  return { transporter: cachedTransporter, config };
}

async function sendTestEmail({ to, subject, message }) {
  if (!to) {
    throw new Error('Recipient email address is required');
  }

  const { transporter, config } = await getTransporter();
  const mailOptions = {
    from: config.from,
    to,
    subject: subject || 'PhishLab SMTP Test',
    text: message || 'This is a test email from PhishLab SMTP configuration.',
    html: `<p>${(message || 'This is a test email from PhishLab SMTP configuration.').replace(/\n/g, '<br/>')}</p>`
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

function getSmtpStatus() {
  const { config, meta } = assembleSmtpConfig();
  try {
    validateConfig(config);
    return {
      configured: true,
      host: config.host,
      secure: config.secure,
      hasAuth: Boolean(config.auth),
      from: config.from,
      usingEnv: meta.usingEnv,
      stored: meta.stored,
    };
  } catch (error) {
    return {
      configured: false,
      reason: error instanceof Error ? error.message : 'SMTP configuration invalid',
      usingEnv: meta.usingEnv,
      stored: meta.stored,
    };
  }
}

module.exports = {
  sendTestEmail,
  getSmtpStatus,
};
