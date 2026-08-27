import { verifyToken } from '../utils/authUtils';
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : req.headers['x-auth-token'];
    if (!token) {
        res.status(401).json({ error: 'Access denied. No authentication token provided.' });
        return;
    }
    const payload = verifyToken(token);
    if (!payload) {
        res.status(403).json({ error: 'Invalid or expired authentication token.' });
        return;
    }
    req.user = payload;
    next();
}
