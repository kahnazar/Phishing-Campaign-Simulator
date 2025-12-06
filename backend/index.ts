import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

import authRouter from './controllers/authController';
import templateRouter from './controllers/templateController';
import campaignRouter from './controllers/campaignController';
import recipientRouter from './controllers/recipientController';
import teamRouter from './controllers/teamController';
import emailRouter from './controllers/emailController';
import { getStoredEmailConfig } from './services/emailConfigService';
import { assembleEffectiveEmailConfig } from './services/emailConfigService';
import { startLocalSmtpServer } from './services/localSmtpServer';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

const BUILD_PATH = path.join(__dirname, '..', 'frontend', 'build');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/templates', templateRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api/recipients', recipientRouter);
app.use('/api/team', teamRouter);
app.use('/api/email', emailRouter);

if (fs.existsSync(BUILD_PATH)) {
  app.use(express.static(BUILD_PATH));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return res.sendFile(path.join(BUILD_PATH, 'index.html'));
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  
  // Проверяем, нужно ли запустить локальный SMTP сервер
  try {
    const stored = await getStoredEmailConfig();
    const config = assembleEffectiveEmailConfig(stored);
    if (config.useLocalSmtp) {
      await startLocalSmtpServer(1025);
      console.log('[Local SMTP] Server started automatically on port 1025');
    }
  } catch (error) {
    // Игнорируем ошибки при старте - возможно конфигурация еще не настроена
    console.log('[Local SMTP] Not starting automatically (configuration may be missing)');
  }
});

