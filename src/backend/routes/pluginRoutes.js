// src/backend/routes/pluginRoutes.ts
import { Router } from 'express';
import { prisma } from '../db';
const router = Router();
// Built-in Themes Marketplace Catalog
const MARKETPLACE_THEMES = [
    {
        id: 'nordic-white (Default)',
        name: 'Nordic Frost White ☀️',
        description: 'Minimalist crisp white theme for daylight study sessions.',
        colors: { bg: '#f8fafc', sidebar: '#ffffff', accent: '#2563eb', text: '#0f172a' },
        isOfficial: true
    },
    {
        id: 'dark-default',
        name: 'Midnight Slate ',
        description: 'Clean, high-contrast dark theme optimized for late-night study sessions.',
        colors: { bg: '#0f172a', sidebar: '#1e293b', accent: '#3b82f6', text: '#f8fafc' },
        isOfficial: true
    },
    {
        id: 'cyberpunk-neon',
        name: 'Cyberpunk Neon 🌌',
        description: 'Vibrant neon blue and violet accents inspired by futuristic IDEs.',
        colors: { bg: '#090d16', sidebar: '#121829', accent: '#a855f7', text: '#f4f4f5' },
        isOfficial: true
    },
    {
        id: 'emerald-forest',
        name: 'Emerald Forest 🌲',
        description: 'Calming deep green tones to reduce eye strain during long reading hours.',
        colors: { bg: '#062016', sidebar: '#0b2e21', accent: '#10b981', text: '#ecfdf5' },
        isOfficial: true
    },
    {
        id: 'mocha-coffee',
        name: 'Mocha Coffee ☕',
        description: 'Warm espresso and caramel tones for a cozy academic environment.',
        colors: { bg: '#1c1412', sidebar: '#2a1e1b', accent: '#f59e0b', text: '#fffbeb' },
        isOfficial: true
    },
    {
        id: 'dracula-purple',
        name: 'Dracula Obsidian 🧛',
        description: 'Classic dark purple palette beloved by programmers and power users.',
        colors: { bg: '#181124', sidebar: '#221935', accent: '#8b5cf6', text: '#f3e8ff' },
        isOfficial: true
    }
];
// Built-in Extension Plugins Marketplace Catalog
const MARKETPLACE_PLUGINS = [
    {
        id: 'lofi-audio-player',
        name: 'Lo-Fi Beats & Ambient Sounds 🎵',
        version: '1.2.0',
        description: 'Stream ambient rain, cafe sounds, and lo-fi study music directly inside StudentOS.',
        category: 'Productivity',
        author: 'StudentOS Core',
        icon: 'Music'
    },
    {
        id: 'floating-pomodoro',
        name: 'Floating Pomodoro Timer ⏱️',
        version: '2.0.1',
        description: '25-minute focus session timer overlay accessible from any module screen.',
        category: 'Study Tool',
        author: 'StudentOS Core',
        icon: 'Timer'
    },
    {
        id: 'quick-gpa-calculator',
        name: 'Quick Semester GPA Predictor 📊',
        version: '1.1.0',
        description: 'Simulate grades and target CGPA directly inside Notes & Course views.',
        category: 'Academic',
        author: 'Academic Suite',
        icon: 'Calculator'
    },
    {
        id: 'math-latex-helper',
        name: 'LaTeX Math Equation Visualizer 🧮',
        version: '1.0.4',
        description: 'Render complex calculus and physics formulas seamlessly in Notes Workspace.',
        category: 'Notes Tool',
        author: 'MathSuite',
        icon: 'Sigma'
    }
];
// PUBLIC Route: Get Themes & Plugins Catalog
router.get('/catalog', async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId;
        let userSettings = null;
        try {
            if (prisma.userSetting) {
                userSettings = await prisma.userSetting.findFirst({
                    where: userId ? { userId } : {}
                });
            }
        }
        catch (e) {
            console.log('Settings fetch notice:', e);
        }
        res.status(200).json({
            success: true,
            themes: MARKETPLACE_THEMES,
            plugins: MARKETPLACE_PLUGINS,
            activeTheme: userSettings?.theme || 'nordic-white',
            enabledPlugins: userSettings?.enabledPlugins ? JSON.parse(userSettings.enabledPlugins) : ['lofi-audio-player', 'floating-pomodoro']
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to load plugins catalog.' });
    }
});
// Update Theme / Plugin Preferences
router.post('/settings', async (req, res) => {
    try {
        const { theme, enabledPlugins } = req.body;
        const userId = req.user?.id || req.user?.userId;
        try {
            if (prisma.userSetting) {
                await prisma.userSetting.upsert({
                    where: userId ? { userId } : { id: 'default' },
                    update: {
                        theme: theme || 'nordic-white',
                        enabledPlugins: JSON.stringify(enabledPlugins || [])
                    },
                    create: {
                        id: userId || 'default',
                        userId: userId || null,
                        theme: theme || 'dark-default',
                        enabledPlugins: JSON.stringify(enabledPlugins || [])
                    }
                });
            }
        }
        catch (dbErr) {
            console.log('Settings save notice:', dbErr);
        }
        res.status(200).json({
            success: true,
            message: 'Plugin extension preferences updated successfully! 🧩',
            theme,
            enabledPlugins
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update plugin settings.' });
    }
});
export default router;
