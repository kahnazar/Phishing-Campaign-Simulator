import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Поддержка отдельных переменных для Docker
const getConnectionString = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Fallback на отдельные переменные для docker-compose
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'phishlab';
  
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

const pool = new Pool({
  connectionString: getConnectionString(),
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

// Helper function to execute queries
export async function query<T = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    // Логируем только если запрос не слишком длинный
    if (text.length < 200) {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    } else {
      console.log('Executed query', { text: text.substring(0, 100) + '...', duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Query error', { text: text.substring(0, 200), error });
    throw error;
  }
}

// Helper function to get a client for transactions
export async function getClient(): Promise<pg.PoolClient> {
  return pool.connect();
}

