import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET USER STUDY SESSION STATS & TOTAL FOCUS HOURS
export async function getStudySessionStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sessions = await prisma.studySession.findMany({
      where: { userId },
      include: {
        course: { select: { code: true, name: true, color: true } }
      },
      orderBy: { sessionDate: 'desc' }
    });

   const totalMinutes = sessions.reduce((sum: any, s: any) => sum + s.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    res.status(200).json({
      stats: {
        totalSessions: sessions.length,
        totalMinutes,
        totalHours
      },
      recentSessions: sessions.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch study session stats' });
  }
}

// 2. LOG COMPLETED POMODORO FOCUS STUDY SESSION
export async function logStudySession(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { durationMinutes, courseId, notes } = req.body;

    if (!durationMinutes) {
      res.status(400).json({ error: 'Duration in minutes is required.' });
      return;
    }

    const newSession = await prisma.studySession.create({
      data: {
        userId,
        durationMinutes: Number(durationMinutes),
        courseId: courseId ? String(courseId) : null,
        sessionDate: new Date(),
        notes: notes || 'Completed Pomodoro Focus Session'
      },
      include: {
        course: { select: { code: true, name: true, color: true } }
      }
    });

    res.status(201).json({ message: 'Focus study session logged!', session: newSession });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to log study session' });
  }
}