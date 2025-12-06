import nodemailer from 'nodemailer';
import {
  getStoredEmailConfig,
  assembleEffectiveEmailConfig,
  getEmailConfigForClient,
} from './emailConfigService';
import { startLocalSmtpServer, isLocalSmtpRunning } from './localSmtpServer';

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedConfigSignature: string | null = null;

async function getTransporter(userId?: string) {
  const stored = await getStoredEmailConfig(userId);
  const config = assembleEffectiveEmailConfig(stored);

  // Если используется локальный SMTP, запускаем сервер если он еще не запущен
  if (config.useLocalSmtp) {
    if (!isLocalSmtpRunning()) {
      await startLocalSmtpServer(config.port);
    }
  }

  const signature = JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    hasAuth: Boolean(config.user && config.password),
    useLocalSmtp: config.useLocalSmtp,
  });

  if (!cachedTransporter || cachedConfigSignature !== signature) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user && config.password
        ? {
            user: config.user,
            pass: config.password,
          }
        : undefined,
      // Для локального SMTP отключаем проверку TLS
      ...(config.useLocalSmtp ? { tls: { rejectUnauthorized: false } } : {}),
    });
    cachedConfigSignature = signature;
  }

  // Для локального SMTP не проверяем подключение
  if (!config.useLocalSmtp) {
    await cachedTransporter.verify();
  }
  return { transporter: cachedTransporter, config };
}

export async function sendTestEmail(
  { to, subject, message }: { to: string; subject?: string; message?: string },
  userId?: string,
) {
  if (!to) {
    throw new Error('Recipient email address is required');
  }

  const { transporter, config } = await getTransporter(userId);
  const mailOptions = {
    from: config.from,
    to,
    subject: subject || 'PhishLab SMTP Test',
    text: message || 'This is a test email from PhishLab SMTP configuration.',
    html: `<p>${(message || 'This is a test email from PhishLab SMTP configuration.').replace(/\n/g, '<br/>')}</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

export async function getSmtpStatus(userId?: string) {
  try {
    const stored = await getStoredEmailConfig(userId);
    const config = assembleEffectiveEmailConfig(stored);
    
    // Если используется локальный SMTP, проверяем статус сервера
    if (config.useLocalSmtp) {
      return {
        configured: true,
        host: config.host,
        port: config.port,
        secure: config.secure,
        hasAuth: false,
        from: config.from,
        useLocalSmtp: true,
        localServerRunning: isLocalSmtpRunning(),
        usingEnv: {
          host: false,
          port: false,
          secure: false,
          user: false,
          pass: false,
          from: false,
        },
        stored: {
          host: 'localhost',
          port: 1025,
          secure: false,
          user: null,
          hasPassword: false,
          from: stored?.fromEmail ?? null,
        },
      };
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS,
      SMTP_FROM,
    } = process.env;

    return {
      configured: true,
      host: config.host,
      secure: config.secure,
      hasAuth: Boolean(config.user && config.password),
      from: config.from,
      usingEnv: {
        host: Boolean(SMTP_HOST),
        port: Boolean(SMTP_PORT),
        secure: SMTP_SECURE !== undefined,
        user: Boolean(SMTP_USER),
        pass: Boolean(SMTP_PASS),
        from: Boolean(SMTP_FROM),
      },
      stored: {
        host: stored?.host ?? null,
        port: stored?.port ?? null,
        secure: stored?.secure ?? null,
        user: stored?.username ?? null,
        hasPassword: Boolean(stored?.password),
        from: stored?.fromEmail ?? null,
      },
    };
  } catch (error) {
    const stored = await getStoredEmailConfig(userId);
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASS,
      SMTP_FROM,
    } = process.env;

    return {
      configured: false,
      reason: error instanceof Error ? error.message : 'SMTP configuration invalid',
      useLocalSmtp: stored?.useLocalSmtp ?? false,
      localServerRunning: false,
      usingEnv: {
        host: Boolean(SMTP_HOST),
        port: Boolean(SMTP_PORT),
        secure: SMTP_SECURE !== undefined,
        user: Boolean(SMTP_USER),
        pass: Boolean(SMTP_PASS),
        from: Boolean(SMTP_FROM),
      },
      stored: {
        host: stored?.host ?? null,
        port: stored?.port ?? null,
        secure: stored?.secure ?? null,
        user: stored?.username ?? null,
        hasPassword: Boolean(stored?.password),
        from: stored?.fromEmail ?? null,
      },
    };
  }
}

export { getEmailConfigForClient, updateEmailConfig } from './emailConfigService';

