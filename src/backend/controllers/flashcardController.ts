import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET FLASHCARDS DUE FOR REVIEW TODAY
export async function getDueFlashcards(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { courseId } = req.query;
    const now = new Date();

    const whereClause: any = { userId };
    if (courseId && String(courseId) !== 'ALL') {
      whereClause.courseId = String(courseId);
    }

    // Fetch cards due for review or all questions
    const dueCards = await prisma.questionBank.findMany({
      where: {
        ...whereClause,
        nextReviewDate: { lte: now }
      },
      include: {
        course: { select: { code: true, name: true, color: true } },
        options: true
      },
      orderBy: { nextReviewDate: 'asc' }
    });

    // If no cards due today, fetch remaining deck questions for practice
    let allCards = dueCards;
    if (dueCards.length === 0) {
      allCards = await prisma.questionBank.findMany({
        where: whereClause,
        include: {
          course: { select: { code: true, name: true, color: true } },
          options: true
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
      });
    }

    res.status(200).json({ 
      dueCount: dueCards.length,
      flashcards: allCards 
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch flashcards' });
  }
}

// 2. PROCESS FLASHCARD REVIEW (SUPERMEMO-2 SPACED REPETITION ALGORITHM)
export async function reviewFlashcard(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const cardId = String(req.params.id);
    const { rating } = req.body; // 'HARD', 'GOOD', 'EASY'

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingCard = await prisma.questionBank.findFirst({
      where: { id: cardId, userId }
    });

    if (!existingCard) {
      res.status(404).json({ error: 'Flashcard not found.' });
      return;
    }

    let intervalDays = existingCard.intervalDays || 1;
    let easeFactor = existingCard.easeFactor || 2.5;
    let reviewCount = existingCard.reviewCount || 0;

    // SuperMemo-2 (SM-2) Spaced Repetition Calculations
    if (rating === 'HARD') {
      // Hard: Reset interval to 1 day
      intervalDays = 1;
      reviewCount = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 'GOOD') {
      // Good: Standard progression
      if (reviewCount === 0) {
        intervalDays = 1;
      } else if (reviewCount === 1) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      reviewCount += 1;
    } else if (rating === 'EASY') {
      // Easy: Accelerated progression
      if (reviewCount === 0) {
        intervalDays = 3;
      } else if (reviewCount === 1) {
        intervalDays = 7;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor * 1.3);
      }
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      reviewCount += 1;
    }

    // Calculate Next Review Date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

    const updatedCard = await prisma.questionBank.update({
      where: { id: cardId },
      data: {
        intervalDays,
        easeFactor,
        reviewCount,
        nextReviewDate
      },
      include: {
        course: { select: { code: true, name: true, color: true } },
        options: true
      }
    });

    res.status(200).json({ 
      message: 'Flashcard progress updated!',
      flashcard: updatedCard,
      nextReviewInDays: intervalDays 
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process flashcard review' });
  }
}