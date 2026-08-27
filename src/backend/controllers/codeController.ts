import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET ALL CODE SNIPPETS (With Search & Language Filters)
export async function getCodeSnippets(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { language, courseId, isFavorite, search } = req.query;
    const whereClause: any = { userId };

    if (language && String(language) !== 'ALL') {
      whereClause.language = String(language);
    }
    if (courseId) {
      whereClause.courseId = String(courseId);
    }
    if (isFavorite === 'true') {
      whereClause.isFavorite = true;
    }

    if (search) {
      const searchTerm = String(search);
      whereClause.OR = [
        { title: { contains: searchTerm } },
        { codeContent: { contains: searchTerm } },
        { explanation: { contains: searchTerm } },
        { tags: { contains: searchTerm } }
      ];
    }

    const codeSnippets = await prisma.codeSnippet.findMany({
      where: whereClause,
      include: {
        course: { select: { code: true, name: true, color: true } }
      },
      orderBy: [
        { isFavorite: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json({ codeSnippets });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch code snippets' });
  }
}

// 2. CREATE NEW CODE SNIPPET
export async function createCodeSnippet(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, language, codeContent, explanation, githubUrl, tags, courseId } = req.body;

    if (!title || !codeContent) {
      res.status(400).json({ error: 'Title and code content are required.' });
      return;
    }

    const newSnippet = await prisma.codeSnippet.create({
      data: {
        userId,
        title,
        language: language || 'cpp',
        codeContent,
        explanation: explanation || '',
        githubUrl: githubUrl || '',
        tags: tags || '',
        courseId: courseId ? String(courseId) : null
      },
      include: {
        course: { select: { code: true, name: true, color: true } }
      }
    });

    res.status(201).json({ message: 'Code snippet saved!', codeSnippet: newSnippet });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create code snippet' });
  }
}

// 3. UPDATE CODE SNIPPET
export async function updateCodeSnippet(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const snippetId = String(req.params.id);
    const { title, language, codeContent, explanation, githubUrl, tags, courseId, isFavorite } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingSnippet = await prisma.codeSnippet.findFirst({
      where: { id: snippetId, userId }
    });

    if (!existingSnippet) {
      res.status(404).json({ error: 'Code snippet not found or access denied.' });
      return;
    }

    const updatedSnippet = await prisma.codeSnippet.update({
      where: { id: snippetId },
      data: {
        title: title !== undefined ? title : existingSnippet.title,
        language: language !== undefined ? language : existingSnippet.language,
        codeContent: codeContent !== undefined ? codeContent : existingSnippet.codeContent,
        explanation: explanation !== undefined ? explanation : existingSnippet.explanation,
        githubUrl: githubUrl !== undefined ? githubUrl : existingSnippet.githubUrl,
        tags: tags !== undefined ? tags : existingSnippet.tags,
        courseId: courseId !== undefined ? (courseId ? String(courseId) : null) : existingSnippet.courseId,
        isFavorite: isFavorite !== undefined ? Boolean(isFavorite) : existingSnippet.isFavorite
      },
      include: {
        course: { select: { code: true, name: true, color: true } }
      }
    });

    res.status(200).json({ message: 'Code snippet updated!', codeSnippet: updatedSnippet });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update code snippet' });
  }
}

// 4. TOGGLE FAVORITE SNIPPET
export async function toggleFavoriteSnippet(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const snippetId = String(req.params.id);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingSnippet = await prisma.codeSnippet.findFirst({
      where: { id: snippetId, userId }
    });

    if (!existingSnippet) {
      res.status(404).json({ error: 'Snippet not found.' });
      return;
    }

    const updatedSnippet = await prisma.codeSnippet.update({
      where: { id: snippetId },
      data: { isFavorite: !existingSnippet.isFavorite }
    });

    res.status(200).json({ codeSnippet: updatedSnippet });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to toggle favorite' });
  }
}

// 5. DELETE CODE SNIPPET
export async function deleteCodeSnippet(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const snippetId = String(req.params.id);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingSnippet = await prisma.codeSnippet.findFirst({
      where: { id: snippetId, userId }
    });

    if (!existingSnippet) {
      res.status(404).json({ error: 'Snippet not found.' });
      return;
    }

    await prisma.codeSnippet.delete({
      where: { id: snippetId }
    });

    res.status(200).json({ message: 'Code snippet deleted!' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete code snippet' });
  }
}