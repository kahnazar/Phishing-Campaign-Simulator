const nodemailer = require('nodemailer');

let cachedTransporter = null;
let cachedConfigSignature = null;

function getSmtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;

  return {
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: SMTP_SECURE === 'true' || SMTP_SECURE === '1' || SMTP_PORT === '465',
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    from: SMTP_FROM,
  };
}

function validateConfig(config) {
  if (!config.host) {
    throw new Error('SMTP_HOST environment variable is required');
  }
  if (!config.from) {
    throw new Error('SMTP_FROM environment variable is required');
  }
  if (config.auth && (!config.auth.user || !config.auth.pass)) {
    throw new Error('SMTP_USER and SMTP_PASS must both be provided');
  }
}

async function getTransporter() {
  const config = getSmtpConfig();
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
  try {
    const config = getSmtpConfig();
    validateConfig(config);
    return {
      configured: true,
      host: config.host,
      secure: config.secure,
      hasAuth: Boolean(config.auth),
      from: config.from,
    };
  } catch (error) {
    return {
      configured: false,
      reason: error.message,
    };
  }
}

module.exports = {
  sendTestEmail,
  getSmtpStatus,
};
