import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET ALL CALENDAR EVENTS
export async function getCalendarEvents(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { eventType, courseId } = req.query;
    const whereClause: any = { userId };

    if (eventType && String(eventType) !== 'ALL') {
      whereClause.eventType = String(eventType);
    }
    if (courseId) {
      whereClause.courseId = String(courseId);
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      include: {
        course: { select: { code: true, name: true, color: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch calendar events' });
  }
}

// 2. CREATE NEW CALENDAR EVENT
export async function createCalendarEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, eventType, startTime, endTime, location, description, courseId } = req.body;

    if (!title || !startTime) {
      res.status(400).json({ error: 'Event title and start time are required.' });
      return;
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        eventType: eventType || 'PERSONAL',
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : new Date(startTime),
        location: location || '',
        description: description || '',
        courseId: courseId ? String(courseId) : null
      },
      include: {
        course: { select: { code: true, name: true, color: true } }
      }
    });

    res.status(201).json({ message: 'Event created successfully!', event: newEvent });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create calendar event' });
  }
}

// 3. UPDATE CALENDAR EVENT
export async function updateCalendarEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const eventId = String(req.params.id);
    const { title, eventType, startTime, endTime, location, description, courseId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { id: eventId, userId }
    });

    if (!existingEvent) {
      res.status(404).json({ error: 'Event not found or access denied.' });
      return;
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: title !== undefined ? title : existingEvent.title,
        eventType: eventType !== undefined ? eventType : existingEvent.eventType,
        startTime: startTime ? new Date(startTime) : existingEvent.startTime,
        endTime: endTime ? new Date(endTime) : existingEvent.endTime,
        location: location !== undefined ? location : existingEvent.location,
        description: description !== undefined ? description : existingEvent.description,
        courseId: courseId !== undefined ? (courseId ? String(courseId) : null) : existingEvent.courseId
      },
      include: {
        course: { select: { code: true, name: true, color: true } }
      }
    });

    res.status(200).json({ message: 'Event updated successfully!', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update calendar event' });
  }
}

// 4. DELETE CALENDAR EVENT
export async function deleteCalendarEvent(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const eventId = String(req.params.id);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingEvent = await prisma.calendarEvent.findFirst({
      where: { id: eventId, userId }
    });

    if (!existingEvent) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId }
    });

    res.status(200).json({ message: 'Event deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete calendar event' });
  }
}