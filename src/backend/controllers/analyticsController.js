import { prisma } from '../db';
export async function getAnalytics(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const [courses, tasks, transactions, attendanceLogs, notesCount, questionsCount, codeCount, profile] = await Promise.all([
            prisma.course.findMany({ where: { userId } }),
            prisma.task.findMany({ where: { userId } }),
            prisma.transaction.findMany({ where: { userId } }),
            prisma.attendanceLog.findMany({ where: { course: { userId } } }),
            prisma.note.count({ where: { userId } }),
            prisma.questionBank.count({ where: { userId } }),
            prisma.codeSnippet.count({ where: { userId } }),
            prisma.universityProfile.findUnique({ where: { userId } })
        ]);
        // 1. Task Completion Stats
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
        const taskCompletionRatio = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
        // 2. Class Attendance Stats
        const totalClasses = attendanceLogs.length;
        const presentClasses = attendanceLogs.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const attendanceRatio = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;
        // 3. Financial Health Stats
        let totalIncome = 0;
        let totalExpense = 0;
        transactions.forEach(t => {
            if (t.type === 'INCOME')
                totalIncome += t.amount;
            if (t.type === 'EXPENSE')
                totalExpense += t.amount;
        });
        const netSavings = totalIncome - totalExpense;
        const budgetHealthScore = totalIncome > 0 ? Math.min(100, Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))) : 80;
        // 4. Dynamic Productivity Score Calculation (Weighted Formula)
        // 35% Attendance + 35% Task Completion + 20% Budget Health + 10% Resource Creation
        const resourceScore = Math.min(100, (notesCount + questionsCount + codeCount) * 10);
        const productivityScore = Math.round((attendanceRatio * 0.35) +
            (taskCompletionRatio * 0.35) +
            (budgetHealthScore * 0.20) +
            (resourceScore * 0.10));
        res.status(200).json({
            analytics: {
                productivityScore,
                taskCompletionRatio,
                completedTasks,
                totalTasks,
                attendanceRatio,
                presentClasses,
                totalClasses,
                totalIncome,
                totalExpense,
                netSavings,
                notesCount,
                questionsCount,
                codeCount,
                coursesCount: courses.length,
                earnedCredits: profile?.earnedCredits || 64,
                targetCgpa: profile?.targetCgpa || 4.00
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch analytics' });
    }
}
