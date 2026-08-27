declare const process: any;
import { generateLicenseKey } from '../src/backend/utils/licenseUtils';

// Read Request Code from command line argument
const requestCode = process.argv[2];

if (!requestCode) {
  console.log('\n❌ Error: Please provide a Student Request Code.');
  console.log('Usage Example: npx tsx scripts/generateKey.ts STOS-REQ-8F12-99A0\n');
  process.exit(1);
}

const licenseKey = generateLicenseKey(requestCode);

console.log('\n=====================================================');
console.log('🔑 STUDENT OS — OWNER MASTER LICENSE KEY GENERATOR');
console.log('=====================================================');
console.log(`Student Request Code:  ${requestCode.trim().toUpperCase()}`);
console.log(`Generated License Key: ${licenseKey}`);
console.log('=====================================================');
console.log('Send this License Key to the student to activate their app!\n');