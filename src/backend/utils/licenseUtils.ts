import crypto from 'crypto';
import os from 'os';

// SECRET MASTER KEY (ONLY YOU KNOW THIS KEY)
const OWNER_MASTER_SECRET = 'STUDENT_OS_OWNER_MASTER_SECRET_KEY_2026';

// 1. GENERATE HARDWARE MACHINE REQUEST CODE
export function getHardwareRequestCode(userId: string): string {
  const hostname = os.hostname();
  const platform = os.platform();
  const cpus = os.cpus().map(c => c.model).join('');
  const rawString = `${hostname}-${platform}-${cpus}-${userId}`;

  const hash = crypto.createHash('sha256').update(rawString).digest('hex').toUpperCase();
  const part1 = hash.substring(0, 4);
  const part2 = hash.substring(4, 8);
  const part3 = hash.substring(8, 12);

  return `STOS-REQ-${part1}-${part2}-${part3}`;
}

// 2. GENERATE MATCHING LICENSE KEY (USED BY YOU / ADMIN)
export function generateLicenseKey(requestCode: string): string {
  const hmac = crypto.createHmac('sha256', OWNER_MASTER_SECRET);
  hmac.update(requestCode.trim().toUpperCase());
  const hash = hmac.digest('hex').toUpperCase();

  const part1 = hash.substring(0, 4);
  const part2 = hash.substring(4, 8);
  const part3 = hash.substring(8, 12);

  return `STOS-KEY-${part1}-${part2}-${part3}`;
}

// 3. VERIFY LICENSE KEY OFFLINE
export function verifyLicenseKey(requestCode: string, licenseKey: string): boolean {
  if (!requestCode || !licenseKey) return false;
  const expectedKey = generateLicenseKey(requestCode);
  return expectedKey.trim().toUpperCase() === licenseKey.trim().toUpperCase();
}