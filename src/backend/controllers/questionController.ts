import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET ALL USER QUESTIONS (With Search & Filters)
export async function getQuestions(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { courseId, questionType, difficulty, search } = req.query;

    const whereClause: any = { userId };

    if (courseId) whereClause.courseId = String(courseId);
    if (questionType && String(questionType) !== 'ALL') whereClause.questionType = String(questionType);
    if (difficulty && String(difficulty) !== 'ALL') whereClause.difficulty = String(difficulty);

    if (search) {
      const searchTerm = String(search);
      whereClause.OR = [
        { question: { contains: searchTerm } },
        { answer: { contains: searchTerm } },
        { topic: { contains: searchTerm } },
        { chapter: { contains: searchTerm } }
      ];
    }

    const questions = await prisma.questionBank.findMany({
      where: whereClause,
      include: {
        course: {
          select: { code: true, name: true, color: true }
        },
        options: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch questions' });
  }
}

// 2. CREATE NEW QUESTION
export async function createQuestion(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { 
      courseId, 
      subject, 
      chapter, 
      topic, 
      questionType, 
      difficulty, 
      question, 
      answer, 
      explanation, 
      marks, 
      options 
    } = req.body;

    if (!courseId || !question) {
      res.status(400).json({ error: 'Course and question text are required.' });
      return;
    }

    const newQuestion = await prisma.questionBank.create({
      data: {
        userId,
        courseId: String(courseId),
        subject: subject || '',
        chapter: chapter || '',
        topic: topic || 'General',
        questionType: questionType || 'SHORT',
        difficulty: difficulty || 'MEDIUM',
        question,
        answer: answer || '',
        explanation: explanation || '',
        marks: marks ? Number(marks) : 1,
        options: {
          create: Array.isArray(options) ? options.map((opt: any) => ({
            optionText: String(opt.optionText || ''),
            isCorrect: Boolean(opt.isCorrect)
          })) : []
        }
      },
      include: {
        course: {
          select: { code: true, name: true, color: true }
        },
        options: true
      }
    });

    res.status(201).json({ message: 'Question created successfully!', question: newQuestion });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create question' });
  }
}

// 3. UPDATE QUESTION
export async function updateQuestion(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const questionId = String(req.params.id);
    const { 
      subject, 
      chapter, 
      topic, 
      questionType, 
      difficulty, 
      question, 
      answer, 
      explanation, 
      marks, 
      options 
    } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingQuestion = await prisma.questionBank.findFirst({
      where: { id: questionId, userId }
    });

    if (!existingQuestion) {
      res.status(404).json({ error: 'Question not found or access denied.' });
      return;
    }

    // Update options if provided
    if (Array.isArray(options)) {
      await prisma.questionOption.deleteMany({
        where: { questionId }
      });
    }

    const updatedQuestion = await prisma.questionBank.update({
      where: { id: questionId },
      data: {
        subject: subject !== undefined ? subject : existingQuestion.subject,
        chapter: chapter !== undefined ? chapter : existingQuestion.chapter,
        topic: topic !== undefined ? topic : existingQuestion.topic,
        questionType: questionType !== undefined ? questionType : existingQuestion.questionType,
        difficulty: difficulty !== undefined ? difficulty : existingQuestion.difficulty,
        question: question !== undefined ? question : existingQuestion.question,
        answer: answer !== undefined ? answer : existingQuestion.answer,
        explanation: explanation !== undefined ? explanation : existingQuestion.explanation,
        marks: marks !== undefined ? Number(marks) : existingQuestion.marks,
        options: Array.isArray(options) ? {
          create: options.map((opt: any) => ({
            optionText: String(opt.optionText || ''),
            isCorrect: Boolean(opt.isCorrect)
          }))
        } : undefined
      },
      include: {
        course: {
          select: { code: true, name: true, color: true }
        },
        options: true
      }
    });

    res.status(200).json({ message: 'Question updated successfully!', question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update question' });
  }
}

// 4. DELETE QUESTION
export async function deleteQuestion(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const questionId = String(req.params.id);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingQuestion = await prisma.questionBank.findFirst({
      where: { id: questionId, userId }
    });

    if (!existingQuestion) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }

    await prisma.questionBank.delete({
      where: { id: questionId }
    });

    res.status(200).json({ message: 'Question deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete question' });
  }
}