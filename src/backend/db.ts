// src/backend/db.ts
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '../generated/client';

function prepareDatabaseUrl(): string {
  try {
    if (process.env.VERCEL) {
      const tmpDbPath = '/tmp/dev.db';
      const localTemplate = path.resolve(process.cwd(), 'prisma', 'dev.db');

      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(localTemplate)) {
          fs.copyFileSync(localTemplate, tmpDbPath);
        } else {
          fs.writeFileSync(tmpDbPath, '');
        }
      }
      return 'file:/tmp/dev.db';
    }

    const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : (process.env.HOME || '/tmp') + '/.local/share');
    const dbDir = path.join(appData, 'studentos');

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'dev.db');

    if (!fs.existsSync(dbPath)) {
      const localTemplate = path.resolve(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(localTemplate)) {
        try {
          fs.copyFileSync(localTemplate, dbPath);
        } catch (e) {
          console.log('Copy template notice:', e);
        }
      }
    }

    const normalizedPath = dbPath.replace(/\\/g, '/');
    return `file:${normalizedPath}`;
  } catch (err) {
    console.error('Database URL prep error:', err);
    return 'file:/tmp/dev.db';
  }
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