import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'student-os-local-secret-key-2026';
// 1. Password Hashing
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}
// 2. Password Verification
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
// 3. Generate JWT Token
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
// 4. Verify JWT Token
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
