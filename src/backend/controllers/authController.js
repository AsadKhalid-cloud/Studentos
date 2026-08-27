import { prisma } from '../db';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils';
// 1. REGISTER NEW USER
export async function register(req, res) {
    try {
        const { username, email, password, universityName, department, degreeProgram } = req.body;
        if (!username || !email || !password) {
            res.status(400).json({ error: 'Username, email, and password are required.' });
            return;
        }
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });
        if (existingUser) {
            res.status(400).json({ error: 'User with this email or username already exists.' });
            return;
        }
        // Hash Password
        const passwordHash = await hashPassword(password);
        // Create User & Initialize Default University Profile in Transaction
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                universityProfile: {
                    create: {
                        universityName: universityName || 'My University',
                        department: department || 'Department of IT',
                        degreeProgram: degreeProgram || 'BS Information Technology'
                    }
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true,
                createdAt: true,
                universityProfile: true
            }
        });
        // Generate Token
        const payload = { userId: newUser.id, username: newUser.username, email: newUser.email };
        const token = generateToken(payload);
        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: newUser
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Registration failed' });
    }
}
// 2. LOGIN USER
export async function login(req, res) {
    try {
        const { loginIdentifier, password } = req.body;
        if (!loginIdentifier || !password) {
            res.status(400).json({ error: 'Email/Username and password are required.' });
            return;
        }
        // Find User
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: loginIdentifier }, { username: loginIdentifier }]
            },
            include: {
                universityProfile: true
            }
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials.' });
            return;
        }
        // Verify Password
        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid credentials.' });
            return;
        }
        // Generate Token
        const payload = { userId: user.id, username: user.username, email: user.email };
        const token = generateToken(payload);
        // Sanitize user object
        const { passwordHash: _, pinCodeHash: __, ...userWithoutSecrets } = user;
        res.status(200).json({
            message: 'Login successful!',
            token,
            user: userWithoutSecrets
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Login failed' });
    }
}
// 3. GET CURRENT LOGGED IN USER PROFILE
export async function getMe(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true,
                createdAt: true,
                universityProfile: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch profile' });
    }
}
// 4. PERMANENTLY DELETE USER ACCOUNT & PURGE DATA
export async function deleteAccount(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Prisma Cascade Delete will automatically delete all linked user records
        await prisma.user.delete({
            where: { id: userId }
        });
        res.status(200).json({ message: 'User account and all associated data deleted successfully!' });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete account' });
    }
}
