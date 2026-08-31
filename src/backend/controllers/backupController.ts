import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET DATABASE STATS & RECORD COUNTS
export async function getBackupStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const [notesCount, coursesCount, questionsCount, codeCount, transactionsCount, tasksCount, eventsCount] = await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.course.count({ where: { userId } }),
      prisma.questionBank.count({ where: { userId } }),
      prisma.codeSnippet.count({ where: { userId } }),
      prisma.transaction.count({ where: { userId } }),
      prisma.task.count({ where: { userId } }),
      prisma.calendarEvent.count({ where: { userId } })
    ]);

    res.status(200).json({
      stats: {
        notesCount,
        coursesCount,
        questionsCount,
        codeCount,
        transactionsCount,
        tasksCount,
        eventsCount,
        totalRecords: notesCount + coursesCount + questionsCount + codeCount + transactionsCount + tasksCount + eventsCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch backup stats' });
  }
}

// 2. EXPORT FULL JSON DATABASE BACKUP
export async function exportBackup(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const [
      user, 
      universityProfile, 
      semesters, 
      courses, 
      notes, 
      questionBank, 
      codeSnippets, 
      budgetCategories, 
      transactions, 
      tasks, 
      calendarEvents
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.universityProfile.findFirst({ where: { userId } }),
      prisma.semester.findMany({ where: { userId } }),
      prisma.course.findMany({ where: { userId } }),
      prisma.note.findMany({ where: { userId } }),
      prisma.questionBank.findMany({ where: { userId }, include: { options: true } }),
      prisma.codeSnippet.findMany({ where: { userId } }),
      prisma.budgetCategory.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId } }),
      prisma.task.findMany({ where: { userId } }),
      prisma.calendarEvent.findMany({ where: { userId } })
    ]);

    if (!user) {
      res.status(404).json({ error: 'User data not found.' });
      return;
    }

    // Sanitize sensitive secrets before exporting
    const { passwordHash: _, pinCodeHash: __, ...sanitizedUserData } = user;

    const backupPayload = {
      app: 'StudentOS Academic Management System',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      userData: {
        ...sanitizedUserData,
        universityProfile,
        semesters,
        courses,
        notes,
        questionBank,
        codeSnippets,
        budgetCategories,
        transactions,
        tasks,
        calendarEvents
      }
    };

    res.status(200).json(backupPayload);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to export backup' });
  }
}

// 3. IMPORT / RESTORE DATABASE BACKUP
export async function importBackup(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { backupData } = req.body;

    if (!backupData || !backupData.userData) {
      res.status(400).json({ error: 'Invalid backup file format.' });
      return;
    }

    const { userData } = backupData;

    // Restore Data inside a Transaction
  await prisma.$transaction(async (tx: any) => {
      // 1. Restore Notes
      if (Array.isArray(userData.notes)) {
        for (const note of userData.notes) {
          const existing = await tx.note.findFirst({ where: { id: note.id, userId } });
          if (!existing) {
            await tx.note.create({
              data: {
                id: note.id,
                userId,
                title: note.title,
                contentJson: note.contentJson || '',
                markdownText: note.markdownText || '',
                category: note.category || 'General',
                isPinned: Boolean(note.isPinned),
                isFavorite: Boolean(note.isFavorite),
                color: note.color || '#3B82F6'
              }
            });
          }
        }
      }

      // 2. Restore Code Snippets
      if (Array.isArray(userData.codeSnippets)) {
        for (const code of userData.codeSnippets) {
          const existing = await tx.codeSnippet.findFirst({ where: { id: code.id, userId } });
          if (!existing) {
            await tx.codeSnippet.create({
              data: {
                id: code.id,
                userId,
                title: code.title,
                language: code.language || 'cpp',
                codeContent: code.codeContent,
                explanation: code.explanation || '',
                githubUrl: code.githubUrl || '',
                tags: code.tags || '',
                isFavorite: Boolean(code.isFavorite)
              }
            });
          }
        }
      }

      // 3. Restore Tasks
      if (Array.isArray(userData.tasks)) {
        for (const task of userData.tasks) {
          const existing = await tx.task.findFirst({ where: { id: task.id, userId } });
          if (!existing) {
            await tx.task.create({
              data: {
                id: task.id,
                userId,
                title: task.title,
                description: task.description || '',
                priority: task.priority || 'MEDIUM',
                status: task.status || 'TODO',
                dueDate: new Date(task.dueDate)
              }
            });
          }
        }
      }
    });

    res.status(200).json({ message: 'Backup restored successfully into SQLite database!' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to import backup' });
  }
}