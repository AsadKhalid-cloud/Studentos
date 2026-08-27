import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET ALL USER COURSES WITH ATTENDANCE STATS
export async function getCourses(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch user's current semester or active courses
    const courses = await prisma.course.findMany({
      where: { userId },
      include: {
        semester: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch attendance summary per course
    const coursesWithAttendance = await Promise.all(
      courses.map(async (course) => {
        const attendanceLogs = await prisma.attendanceLog.findMany({
          where: { courseId: course.id }
        });

        const totalClasses = attendanceLogs.length;
        const presentCount = attendanceLogs.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length;
        const attendancePercent = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

        return {
          ...course,
          attendanceStats: {
            totalClasses,
            presentCount,
            attendancePercent
          }
        };
      })
    );

    res.status(200).json({ courses: coursesWithAttendance });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch courses' });
  }
}

// 2. CREATE NEW COURSE
export async function createCourse(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { code, name, instructor, classroom, creditHours, color, status, semesterId } = req.body;

    if (!code || !name) {
      res.status(400).json({ error: 'Course code and course name are required.' });
      return;
    }

    // Get or create active semester if semesterId is not provided
    let activeSemesterId = semesterId;
    if (!activeSemesterId) {
      const activeSemester = await prisma.semester.findFirst({
        where: { userId, isCurrent: true }
      });

      if (activeSemester) {
        activeSemesterId = activeSemester.id;
      } else {
        const newSemester = await prisma.semester.create({
          data: {
            userId,
            name: 'Current Semester',
            isCurrent: true
          }
        });
        activeSemesterId = newSemester.id;
      }
    }

    const newCourse = await prisma.course.create({
      data: {
        userId,
        semesterId: activeSemesterId,
        code,
        name,
        instructor: instructor || '',
        classroom: classroom || '',
        creditHours: creditHours ? Number(creditHours) : 3,
        color: color || '#3B82F6',
        status: status || 'ACTIVE'
      }
    });

    res.status(201).json({ message: 'Course created successfully!', course: newCourse });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create course' });
  }
}

// 3. UPDATE COURSE
export async function updateCourse(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const courseId = String(req.params.id);
    const { code, name, instructor, classroom, creditHours, color, status } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingCourse = await prisma.course.findFirst({
      where: { id: courseId, userId }
    });

    if (!existingCourse) {
      res.status(404).json({ error: 'Course not found or access denied.' });
      return;
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        code: code !== undefined ? code : existingCourse.code,
        name: name !== undefined ? name : existingCourse.name,
        instructor: instructor !== undefined ? instructor : existingCourse.instructor,
        classroom: classroom !== undefined ? classroom : existingCourse.classroom,
        creditHours: creditHours !== undefined ? Number(creditHours) : existingCourse.creditHours,
        color: color !== undefined ? color : existingCourse.color,
        status: status !== undefined ? status : existingCourse.status
      }
    });

    res.status(200).json({ message: 'Course updated successfully!', course: updatedCourse });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update course' });
  }
}

// 4. DELETE COURSE
export async function deleteCourse(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const courseId = String(req.params.id);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingCourse = await prisma.course.findFirst({
      where: { id: courseId, userId }
    });

    if (!existingCourse) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    await prisma.course.delete({
      where: { id: courseId }
    });

    res.status(200).json({ message: 'Course deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete course' });
  }
}

// 5. LOG DAILY ATTENDANCE FOR COURSE
export async function logAttendance(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const courseId = String(req.params.id);
    const { status, remarks, date } = req.body; // PRESENT, ABSENT, LATE, CANCELLED

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!status || !['PRESENT', 'ABSENT', 'LATE', 'CANCELLED'].includes(status)) {
      res.status(400).json({ error: 'Valid status (PRESENT, ABSENT, LATE, CANCELLED) is required.' });
      return;
    }

    const log = await prisma.attendanceLog.create({
      data: {
        courseId,
        date: date ? new Date(date) : new Date(),
        status,
        remarks: remarks || ''
      }
    });

    res.status(201).json({ message: 'Attendance logged successfully!', log });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to log attendance' });
  }
}