import 'dotenv/config';
import { query } from '../config/database';
import { hashPassword } from '../services/passwordService';
import * as fs from 'fs/promises';
import * as path from 'path';

const ADMIN_EMAIL = 'admin@offbox.uz';
const ADMIN_PASSWORD = 'PasswordStrong@!@';
const ADMIN_NAME = 'Admin User';

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Migration 001: Initial schema
    // В production __dirname указывает на dist/scripts, поэтому нужно подняться на уровень выше
    const migration1Path = path.join(__dirname, '../../migrations/001_initial_schema.sql');
    const migration1 = await fs.readFile(migration1Path, 'utf-8');
    
    // Выполняем миграцию целиком
    try {
      await query(migration1);
      console.log('✓ Migration 001 completed');
    } catch (error: any) {
      // Игнорируем ошибки "already exists" и "duplicate"
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate') ||
          error.message?.includes('already defined') ||
          error.code === '42P07' ||
          error.code === '42710' ||
          error.code === '42P16') {
        console.log('✓ Migration 001 already applied');
      } else {
        throw error;
      }
    }
    
    // Migration 002: Local SMTP
    const migration2Path = path.join(__dirname, '../../migrations/002_add_local_smtp.sql');
    const migration2 = await fs.readFile(migration2Path, 'utf-8');
    
    try {
      await query(migration2);
      console.log('✓ Migration 002 completed');
    } catch (error: any) {
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate') ||
          error.message?.includes('already defined') ||
          error.code === '42P07' ||
          error.code === '42710' ||
          error.code === '42P16') {
        console.log('✓ Migration 002 already applied');
      } else {
        throw error;
      }
    }
    
  } catch (error: any) {
    console.error('Migration error:', error.message);
    throw error;
  }
}

async function createAdminUser() {
  console.log('Creating admin user...');
  
  try {
    // Проверяем, существует ли уже пользователь
    const existing = await query(
      'SELECT id FROM users WHERE email = $1',
      [ADMIN_EMAIL.toLowerCase()]
    );
    
    const passwordHash = hashPassword(ADMIN_PASSWORD);
    
    if (existing.rows.length > 0) {
      console.log('✓ Admin user already exists, updating password...');
      await query(
        'UPDATE users SET password_hash = $1, name = $2, role = $3 WHERE email = $4',
        [passwordHash, ADMIN_NAME, 'ADMIN', ADMIN_EMAIL.toLowerCase()]
      );
      console.log('✓ Admin user password updated');
      return;
    }
    
    // Создаем нового пользователя
    await query(
      `INSERT INTO users (email, name, role, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $4, name = $2, role = $3`,
      [ADMIN_EMAIL.toLowerCase(), ADMIN_NAME, 'ADMIN', passwordHash]
    );
    
    console.log(`✓ Admin user created: ${ADMIN_EMAIL}`);
  } catch (error: any) {
    if (error.code === '23505') {
      // Пользователь уже существует
      console.log('✓ Admin user already exists');
    } else {
      throw error;
    }
  }
}

async function waitForDatabase(maxRetries = 30, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await query('SELECT 1');
      return true;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error('Failed to connect to database after retries');
      }
      console.log(`Waiting for database... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

async function main() {
  console.log('Initializing database...');
  const dbUrl = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'phishlab'}`;
  console.log(`Database: ${dbUrl.replace(/:[^:@]+@/, ':****@')}`);
  
  try {
    await waitForDatabase();
    console.log('✓ Database connection established');
    
    await runMigrations();
    await createAdminUser();
    
    console.log('✓ Database initialization completed successfully');
    console.log(`✓ Admin credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Database initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
