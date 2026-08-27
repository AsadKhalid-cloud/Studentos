import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';
import { getHardwareRequestCode, verifyLicenseKey } from '../utils/licenseUtils';

// 1. CHECK APP ACTIVATION STATUS & FETCH REQUEST CODE
export async function getLicenseStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const requestCode = getHardwareRequestCode(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { recoveryCodes: true }
    });

    const storedLicenseKey = user?.recoveryCodes || '';
    const isActivated = verifyLicenseKey(requestCode, storedLicenseKey);

    res.status(200).json({
      requestCode,
      isActivated
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch license status' });
  }
}

// 2. VERIFY & ACTIVATE APP WITH OWNER LICENSE KEY
export async function activateApp(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const { licenseKey } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!licenseKey) {
      res.status(400).json({ error: 'License key is required.' });
      return;
    }

    const requestCode = getHardwareRequestCode(userId);
    const isValid = verifyLicenseKey(requestCode, licenseKey);

    if (!isValid) {
      res.status(400).json({ error: 'Invalid Activation License Key for this machine. Contact Owner for approval.' });
      return;
    }

    // Save verified license key into user record
    await prisma.user.update({
      where: { id: userId },
      data: { recoveryCodes: licenseKey.trim().toUpperCase() }
    });

    res.status(200).json({
      message: 'StudentOS activated successfully!',
      isActivated: true
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Activation failed' });
  }
}