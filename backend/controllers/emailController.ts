import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { sendTestEmail, getSmtpStatus, getEmailConfigForClient, updateEmailConfig } from '../services/emailService';
import {
  startLocalSmtpServer,
  stopLocalSmtpServer,
  isLocalSmtpRunning,
  getStoredEmails,
  getStoredEmailById,
  deleteStoredEmail,
  clearStoredEmails,
  getStoredEmailsCount,
} from '../services/localSmtpServer';

const emailRouter = Router();

emailRouter.use(authenticate);

emailRouter.get('/status', requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const user = _req.user;
    const status = await getSmtpStatus(user?.id);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

emailRouter.post('/test', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { to, subject, message } = req.body || {};
    if (!to) {
      return res.status(400).json({ message: 'Recipient email address (to) is required' });
    }

    const user = req.user;
    const info = await sendTestEmail({ to, subject, message }, user?.id);
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

emailRouter.get('/config', requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const user = _req.user;
    const config = await getEmailConfigForClient(user?.id);
    res.json(config);
  } catch (error) {
    next(error);
  }
});

emailRouter.put('/config', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { host, port, secure, user, pass, from, useLocalSmtp } = req.body || {};
    const currentUser = req.user;
    const updated = await updateEmailConfig(
      { host, port, secure, user, pass, from, useLocalSmtp },
      currentUser?.id,
    );
    
    // Если включен локальный SMTP, запускаем сервер
    if (updated.useLocalSmtp && !isLocalSmtpRunning()) {
      await startLocalSmtpServer(1025);
    } else if (!updated.useLocalSmtp && isLocalSmtpRunning()) {
      await stopLocalSmtpServer();
    }
    
    res.json(updated);
  } catch (error) {
    console.error('Failed to update SMTP config', error);
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update SMTP configuration' });
  }
});

// Local SMTP management endpoints
emailRouter.post('/local/start', requireRole('ADMIN'), async (_req, res, next) => {
  try {
    if (isLocalSmtpRunning()) {
      return res.json({ message: 'Local SMTP server is already running', running: true });
    }
    await startLocalSmtpServer(1025);
    res.json({ message: 'Local SMTP server started', running: true });
  } catch (error) {
    next(error);
  }
});

emailRouter.post('/local/stop', requireRole('ADMIN'), async (_req, res, next) => {
  try {
    if (!isLocalSmtpRunning()) {
      return res.json({ message: 'Local SMTP server is not running', running: false });
    }
    await stopLocalSmtpServer();
    res.json({ message: 'Local SMTP server stopped', running: false });
  } catch (error) {
    next(error);
  }
});

emailRouter.get('/local/status', requireRole('ADMIN'), (_req, res) => {
  res.json({ running: isLocalSmtpRunning(), port: 1025 });
});

emailRouter.get('/local/emails', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const emails = await getStoredEmails(limit, offset);
    const total = await getStoredEmailsCount();
    res.json({ emails, total, limit, offset });
  } catch (error) {
    next(error);
  }
});

emailRouter.get('/local/emails/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const email = await getStoredEmailById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    next(error);
  }
});

emailRouter.delete('/local/emails/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    await deleteStoredEmail(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

emailRouter.delete('/local/emails', requireRole('ADMIN'), async (_req, res, next) => {
  try {
    await clearStoredEmails();
    res.json({ message: 'All emails cleared' });
  } catch (error) {
    next(error);
  }
});

export default emailRouter;

