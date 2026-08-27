import path from 'path';
import fs from 'fs';
import { PrismaClient } from '../generated/client';

function prepareDatabaseUrl(): string {
  // 0. Special Handling for Vercel Serverless (/tmp directory is the ONLY writable directory on AWS Lambda)
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    const localTemplate = path.resolve(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(tmpDbPath) && fs.existsSync(localTemplate)) {
      try {
        fs.copyFileSync(localTemplate, tmpDbPath);
      } catch (e) {
        console.error('Failed to copy SQLite template to /tmp:', e);
      }
    }
    return 'file:/tmp/dev.db';
  }

  // 1. Determine Writable AppData Directory (Desktop / Local)
  const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
  const dbDir = path.join(appData, 'studentos');

  // 2. GUARANTEE PARENT DIRECTORY EXISTS ON DISK
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'dev.db');

  // 3. ONLY COPY IF DEV.DB FILE DOES NOT EXIST (NEVER OVERWRITE EXISTING USER DATA!)
  if (!fs.existsSync(dbPath)) {
    const localTemplate = path.resolve(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(localTemplate)) {
      try {
        fs.copyFileSync(localTemplate, dbPath);
      } catch {
        // ignore
      }
    }
  }

  // 4. Return Standard W3C Compliant file:/// URL
  const normalizedPath = dbPath.replace(/\\/g, '/');
  return `file:${normalizedPath}`;
}

const activeDbUrl = prepareDatabaseUrl();
process.env.DATABASE_URL = activeDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}