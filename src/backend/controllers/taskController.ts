import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET ALL USER TASKS (With Search & Status Filters)
export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { status, priority, courseId, search } = req.query;
    const whereClause: any = { userId };

    if (status && String(status) !== 'ALL') {
      whereClause.status = String(status);
    }
    if (priority && String(priority) !== 'ALL') {
      whereClause.priority = String(priority);
    }
    if (courseId) {
      whereClause.courseId = String(courseId);
    }

    if (search) {
      const searchTerm = String(search);
      whereClause.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        course: { select: { code: true, name: true, color: true } }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch tasks' });
  }
}

// 2. CREATE NEW TASK
export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, description, priority, dueDate, courseId, isRecurring, recurrencePattern } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Task title is required.' });
      return;
    }

    const newTask = await prisma.task.create({
      data: {
        userId,
        title,
        description: description || '',
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 86400000), // Default tomorrow
        courseId: courseId ? String(courseId) : null,
        isRecurring: Boolean(isRecurring),
        recurrencePattern: recurrencePattern || ''
      },
      include: {
        course: { select: { code: true, name: true, color: true } }
      }
    });

    res.status(201).json({ message: 'Task created successfully!', task: newTask });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create task' });
  }
}

// 3. UPDATE TASK
export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const taskId = String(req.params.id);
    const { title, description, priority, status, dueDate, courseId, isRecurring, recurrencePattern } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found or access denied.' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        priority: priority !== undefined ? priority : existingTask.priority,
        status: status !== undefined ? status : existingTask.status,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
        courseId: courseId !== undefined ? (courseId ? String(courseId) : null) : existingTask.courseId,
        isRecurring: isRecurring !== undefined ? Boolean(isRecurring) : existingTask.isRecurring,
        recurrencePattern: recurrencePattern !== undefined ? recurrencePattern : existingTask.recurrencePattern
      },
      include: {
        course: { select: { code: true, name: true, color: true } }
      }
    });

    res.status(200).json({ message: 'Task updated successfully!', task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update task' });
  }
}

// 4. UPDATE TASK STATUS (TODO -> IN_PROGRESS -> COMPLETED)
export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const taskId = String(req.params.id);
    const { status } = req.body; // TODO, IN_PROGRESS, COMPLETED

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!status || !['TODO', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      res.status(400).json({ error: 'Valid status (TODO, IN_PROGRESS, COMPLETED) is required.' });
      return;
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        course: { select: { code: true, name: true, color: true } }
      }
    });

    res.status(200).json({ message: 'Task status updated!', task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update task status' });
  }
}

// 5. DELETE TASK
export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const taskId = String(req.params.id);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(200).json({ message: 'Task deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete task' });
  }
}