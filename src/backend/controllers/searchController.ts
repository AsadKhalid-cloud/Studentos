import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// UNIVERSAL GLOBAL SEARCH ACROSS ALL TABLES
export async function globalSearch(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let query = String(req.query.q || '').trim();

    if (!query || query.length < 2) {
      res.status(200).json({
        notes: [],
        courses: [],
        questions: [],
        codeSnippets: [],
        transactions: [],
        assignments: []
      });
      return;
    }

    // Trim plural 's' if user searches 'notes' -> 'note'
    const cleanQuery = query.endsWith('s') && query.length > 3 ? query.slice(0, -1) : query;

    // Run Parallel Search Queries across SQLite Tables
    const [notes, courses, questions, codeSnippets, transactions, assignments] = await Promise.all([
      // Search Notes
      prisma.note.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { title: { contains: cleanQuery } },
            { markdownText: { contains: query } },
            { category: { contains: query } }
          ]
        },
        take: 5,
        select: { id: true, title: true, category: true, markdownText: true, updatedAt: true }
      }),

      // Search Courses
      prisma.course.findMany({
        where: {
          userId,
          OR: [
            { code: { contains: query } },
            { name: { contains: query } },
            { instructor: { contains: query } },
            { classroom: { contains: query } }
          ]
        },
        take: 5,
        select: { id: true, code: true, name: true, instructor: true, color: true }
      }),

      // Search Question Bank
      prisma.questionBank.findMany({
        where: {
          userId,
          OR: [
            { question: { contains: query } },
            { answer: { contains: query } },
            { topic: { contains: query } },
            { chapter: { contains: query } }
          ]
        },
        take: 5,
        select: { id: true, question: true, questionType: true, difficulty: true, topic: true }
      }),

      // Search Code Snippets
      prisma.codeSnippet.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { language: { contains: query } },
            { codeContent: { contains: query } }
          ]
        },
        take: 5,
        select: { id: true, title: true, language: true, tags: true }
      }),

      // Search Transactions
      prisma.transaction.findMany({
        where: {
          userId,
          OR: [
            { description: { contains: query } },
            { category: { name: { contains: query } } }
          ]
        },
        take: 5,
        include: { category: { select: { name: true } } }
      }),

      // Search Assignments
      prisma.assignment.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } }
          ]
        },
        take: 5,
        select: { id: true, title: true, dueDate: true, submissionStatus: true }
      })
    ]);

    res.status(200).json({
      notes,
      courses,
      questions,
      codeSnippets,
      transactions,
      assignments
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Global search failed' });
  }
}