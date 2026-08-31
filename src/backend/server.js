import 'dotenv/config';
// DOMMatrix Polyfill for Node.js / pdf-parse
if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
        a = 1;
        b = 0;
        c = 0;
        d = 1;
        e = 0;
        f = 0;
        constructor(init) {
            if (Array.isArray(init) && init.length >= 6) {
                this.a = init[0];
                this.b = init[1];
                this.c = init[2];
                this.d = init[3];
                this.e = init[4];
                this.f = init[5];
            }
        }
        multiply() { return this; }
        translate() { return this; }
        scale() { return this; }
        rotate() { return this; }
        inverse() { return this; }
        transformPoint(p) { return p; }
    };
}
import express from 'express';
import cors from 'cors';
import { prisma } from './db';
import authRoutes from './routes/authRoutes';
import noteRoutes from './routes/noteRoutes';
import courseRoutes from './routes/courseRoutes';
import questionRoutes from './routes/questionRoutes';
import budgetRoutes from './routes/budgetRoutes';
import searchRoutes from './routes/searchRoutes';
import calendarRoutes from './routes/calendarRoutes';
import taskRoutes from './routes/taskRoutes';
import codeRoutes from './routes/codeRoutes';
import backupRoutes from './routes/backupRoutes';
import universityRoutes from './routes/universityRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import licenseRoutes from './routes/licenseRoutes';
import flashcardRoutes from './routes/flashcardRoutes';
import studySessionRoutes from './routes/studySessionRoutes';
import graphRoutes from './routes/graphRoutes';
import aiRoutes from './routes/aiRoutes';
import ocrRoutes from './routes/ocrRoutes';
const app = express();
const PORT = process.env.PORT || 4000;
// Core Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Mobile Sync Endpoint (Mounted BEFORE app.listen)
app.get('/api/sync', async (_req, res) => {
    try {
        let notes = [];
        let tasks = [];
        try {
            if (prisma.note)
                notes = await prisma.note.findMany();
            if (prisma.task)
                tasks = await prisma.task.findMany();
        }
        catch (dbErr) {
            console.log('Sync DB Notice:', dbErr);
        }
        // Fallback sample note if database is empty
        if (notes.length === 0) {
            notes = [
                {
                    id: '1',
                    title: 'Welcome to StudentOS Mobile! 📱',
                    content: 'Yeh note aapke Laptop ke Express Backend se live sync hua hai.',
                    category: 'System'
                }
            ];
        }
        res.status(200).json({
            success: true,
            notes,
            tasks,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Sync failed" });
    }
});
// Health Check Endpoint
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
        status: 'ONLINE',
        system: 'StudentOS Local Engine',
        stack: 'React + TypeScript + Vite + Express',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});
// Health Check Endpoint
// PUBLIC MOBILE SYNC ENDPOINT (404 / 401 Fix)
app.get('/api/v1/sync', async (_req, res) => {
    try {
        let notes = [];
        try {
            notes = await prisma.note.findMany({
                take: 50,
                orderBy: { updatedAt: 'desc' }
            });
        }
        catch (dbErr) {
            console.log('Prisma Sync Notice:', dbErr);
        }
        res.status(200).json({
            success: true,
            notes: notes,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Sync failed' });
    }
});
// Database Connection Check Endpoint
app.get('/api/v1/db-check', async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        const userCount = await prisma.user.count();
        res.status(200).json({
            database: 'SQLite (dev.db)',
            status: 'CONNECTED',
            orm: 'Prisma 6',
            totalRegisteredUsers: userCount,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            database: 'SQLite (dev.db)',
            status: 'DISCONNECTED',
            error: error instanceof Error ? error.message : 'Unknown DB Error'
        });
    }
});
// Public Mobile Sync Endpoint (No JWT Token required for Local Wi-Fi Sync)
// Public Mobile Local Wi-Fi Sync Endpoint (Notes, Tasks, Timetable)
// Public Mobile Local Wi-Fi Sync Endpoint (Notes, Tasks, Timetable)
app.get('/api/sync', async (_req, res) => {
    try {
        let notes = [];
        let tasks = [];
        let timetable = [];
        try {
            if (prisma.note)
                notes = await prisma.note.findMany({ take: 20 });
            if (prisma.task)
                tasks = await prisma.task.findMany({ take: 20 });
            if (prisma.timetable)
                timetable = await prisma.timetable.findMany();
        }
        catch (e) {
            console.log('Prisma Sync Notice:', e);
        }
        // Sample data fallback if database tables are empty
        if (notes.length === 0) {
            notes = [
                { id: '1', title: 'Data Structures: AVL Trees', category: 'CS-201', content: 'Tree balancing rotations and complexity analysis.' },
                { id: '2', title: 'Calculus III: Line Integrals', category: 'MTH-301', content: 'Green Theorem and Vector fields notes.' }
            ];
        }
        if (tasks.length === 0) {
            tasks = [
                { id: '1', title: 'Submit OS Lab Report 3', dueDate: 'Tomorrow, 11:59 PM', priority: 'HIGH', completed: false },
                { id: '2', title: 'Read Linear Algebra Chapter 4', dueDate: 'Friday', priority: 'MEDIUM', completed: true }
            ];
        }
        if (timetable.length === 0) {
            timetable = [
                { id: '1', subject: 'Data Structures', time: '09:00 AM - 10:30 AM', room: 'Lab 3', totalClasses: 20, attended: 18 },
                { id: '2', subject: 'Operating Systems', time: '11:00 AM - 12:30 PM', room: 'Hall B', totalClasses: 15, attended: 11 },
                { id: '3', subject: 'Calculus III', time: '02:00 PM - 03:30 PM', room: 'Room 102', totalClasses: 22, attended: 21 }
            ];
        }
        res.status(200).json({
            success: true,
            notes,
            tasks,
            timetable,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Sync failed' });
    }
});
// Imports ke sath:
import pluginRoutes from './routes/pluginRoutes';
// Mount Routes section ke andar:
app.use('/api/v1/plugins', pluginRoutes);
// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/budget', budgetRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/code', codeRoutes);
app.use('/api/v1/backup', backupRoutes);
app.use('/api/v1/university', universityRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/license', licenseRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/sessions', studySessionRoutes);
app.use('/api/v1/graph', graphRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/ocr', ocrRoutes);
// Start Local Express Server with Universal 0.0.0.0 Host Binding
// Start Local Express Server (Only when NOT running on Vercel Serverless)
if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`[StudentOS Backend] Express server running on http://127.0.0.1:${PORT}`);
    });
}
export default app;
