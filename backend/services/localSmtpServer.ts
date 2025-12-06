import { SMTPServer, SMTPServerOptions } from 'smtp-server';
import { simpleParser, ParsedMail } from 'mailparser';
import { query } from '../config/database';

export type StoredEmail = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text: string | null;
  html: string | null;
  headers: any;
  date: Date;
  createdAt: Date;
};

let smtpServer: SMTPServer | null = null;
let isRunning = false;

export async function startLocalSmtpServer(port: number = 1025): Promise<void> {
  if (isRunning && smtpServer) {
    console.log('Local SMTP server is already running');
    return;
  }

  // Таблица создается через миграции, но на всякий случай создаем если её нет
  await query(`
    CREATE TABLE IF NOT EXISTS local_emails (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "from" TEXT NOT NULL,
      "to" TEXT[] NOT NULL,
      subject TEXT,
      text TEXT,
      html TEXT,
      headers JSONB,
      date TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {
    // Таблица уже существует - это нормально
  });
  
  // Создаем индексы если их нет
  await query(`CREATE INDEX IF NOT EXISTS idx_local_emails_created_at ON local_emails(created_at DESC)`).catch(() => {});
  await query(`CREATE INDEX IF NOT EXISTS idx_local_emails_to ON local_emails USING GIN("to")`).catch(() => {});

  const serverOptions: SMTPServerOptions = {
    name: 'PhishLab Local SMTP',
    banner: 'PhishLab Local SMTP Server',
    authMethods: [], // Без аутентификации для локального использования
    disabledCommands: ['AUTH'], // Отключаем AUTH
    onConnect(session: any, callback: (err?: Error) => void) {
      // Принимаем все подключения
      callback();
    },
    onMailFrom(address: any, session: any, callback: (err?: Error) => void) {
      // Принимаем все отправители
      callback();
    },
    onRcptTo(address: any, session: any, callback: (err?: Error) => void) {
      // Принимаем всех получателей
      callback();
    },
    onData(stream: any, session: any, callback: (err?: Error) => void) {
      let emailData = '';

      stream.on('data', (chunk: any) => {
        emailData += chunk.toString();
      });

      stream.on('end', async () => {
        try {
          // Парсим письмо
          const parsed = await simpleParser(emailData);

          // Формируем массив получателей
          let recipients: string[] = [];
          if (parsed.to) {
            if (Array.isArray(parsed.to)) {
              recipients = parsed.to.map(t => {
                if (typeof t === 'string') return t;
                return (t as any).text || (t as any).address || String(t);
              });
            } else {
              const to = parsed.to as any;
              recipients = [to.text || to.address || String(to)];
            }
          }
          if (recipients.length === 0 && session.envelope.rcptTo) {
            recipients = session.envelope.rcptTo.map(r => r.address);
          }

          // Сохраняем в базу данных
          const result = await query<StoredEmail>(
            `INSERT INTO local_emails ("from", "to", subject, text, html, headers, date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
              parsed.from?.text || (parsed.from as any)?.address || session.envelope.mailFrom?.address || 'unknown',
              recipients,
              parsed.subject || '(no subject)',
              parsed.text || null,
              parsed.html || null,
              parsed.headers ? Object.fromEntries(parsed.headers as any) : {},
              parsed.date || new Date(),
            ]
          );

          console.log(`[Local SMTP] Email saved: ${result.rows[0].id} from ${result.rows[0].from} to ${result.rows[0].to.join(', ')}`);
          callback();
        } catch (error: any) {
          console.error('[Local SMTP] Error processing email:', error);
          callback(error as Error);
        }
      });
    },
  };

  smtpServer = new SMTPServer(serverOptions);

  return new Promise((resolve, reject) => {
    smtpServer!.listen(port, '0.0.0.0', () => {
      isRunning = true;
      console.log(`[Local SMTP] Server started on port ${port}`);
      resolve();
    });

    smtpServer!.on('error', (error) => {
      console.error('[Local SMTP] Server error:', error);
      isRunning = false;
      reject(error);
    });
  });
}

export async function stopLocalSmtpServer(): Promise<void> {
  if (smtpServer && isRunning) {
    return new Promise((resolve) => {
      smtpServer!.close(() => {
        isRunning = false;
        smtpServer = null;
        console.log('[Local SMTP] Server stopped');
        resolve();
      });
    });
  }
}

export function isLocalSmtpRunning(): boolean {
  return isRunning;
}

export async function getLocalSmtpPort(): Promise<number> {
  // Возвращаем порт из конфигурации или дефолтный
  return 1025;
}

export async function getStoredEmails(limit: number = 50, offset: number = 0): Promise<StoredEmail[]> {
  const result = await query<StoredEmail>(
    `SELECT * FROM local_emails 
     ORDER BY created_at DESC 
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

export async function getStoredEmailById(id: string): Promise<StoredEmail | null> {
  const result = await query<StoredEmail>(
    'SELECT * FROM local_emails WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function deleteStoredEmail(id: string): Promise<void> {
  await query('DELETE FROM local_emails WHERE id = $1', [id]);
}

export async function clearStoredEmails(): Promise<void> {
  await query('DELETE FROM local_emails');
}

export async function getStoredEmailsCount(): Promise<number> {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM local_emails'
  );
  return parseInt(result.rows[0].count, 10);
}

