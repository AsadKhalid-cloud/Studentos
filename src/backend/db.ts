// src/backend/db.ts
import path from 'path';
import fs from 'fs';

// Safe Prisma Client Import (Supports custom generated client & serverless fallbacks)
let PrismaClient: any;
try {
  PrismaClient = require('../generated/client').PrismaClient;
} catch {
  try {
    PrismaClient = require('@prisma/client').PrismaClient;
  } catch {
    console.log('Prisma Client fallback mode active');
    PrismaClient = class FallbackPrisma {
      note = { findMany: async () => [], create: async (d: any) => d.data, update: async (d: any) => d.data };
      task = { findMany: async () => [], create: async (d: any) => d.data, update: async (d: any) => d.data };
      user = { findFirst: async () => null, create: async (d: any) => d.data, count: async () => 1 };
      $queryRaw = async () => 1;
    };
  }
}

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
    console.error('Database URL prep error, using fallback:', err);
    return 'file:/tmp/dev.db';
  }
}

let activeDbUrl = 'file:/tmp/dev.db';
try {
  activeDbUrl = prepareDatabaseUrl();
  process.env.DATABASE_URL = activeDbUrl;
} catch (e) {
  console.error('Top-level DB prep error:', e);
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
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