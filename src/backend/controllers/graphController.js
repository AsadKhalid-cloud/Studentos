import { prisma } from '../db';
export async function getKnowledgeGraphData(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const [courses, notes, questions, codeSnippets] = await Promise.all([
            prisma.course.findMany({ where: { userId }, select: { id: true, code: true, name: true, color: true } }),
            prisma.note.findMany({ where: { userId }, select: { id: true, title: true, category: true, courseId: true } }),
            prisma.questionBank.findMany({ where: { userId }, select: { id: true, question: true, questionType: true, courseId: true } }),
            prisma.codeSnippet.findMany({ where: { userId }, select: { id: true, title: true, language: true, courseId: true } })
        ]);
        const nodes = [];
        const links = [];
        // 1. Add Course Nodes
        courses.forEach((c) => {
            nodes.push({
                id: `course-${c.id}`,
                label: `${c.code} - ${c.name}`,
                type: 'COURSE',
                color: c.color || '#3B82F6',
                size: 24,
                rawId: c.id
            });
        });
        // 2. Add Note Nodes & Links
        notes.forEach((n) => {
            const nodeId = `note-${n.id}`;
            nodes.push({
                id: nodeId,
                label: n.title || 'Untitled Note',
                type: 'NOTE',
                color: '#10B981',
                size: 16,
                rawId: n.id
            });
            if (n.courseId) {
                links.push({
                    source: `course-${n.courseId}`,
                    target: nodeId,
                    color: '#10B98140'
                });
            }
        });
        // 3. Add Question Nodes & Links
        questions.forEach((q) => {
            const nodeId = `question-${q.id}`;
            nodes.push({
                id: nodeId,
                label: q.question.substring(0, 30) + '...',
                type: 'QUESTION',
                color: '#A855F7',
                size: 14,
                rawId: q.id
            });
            if (q.courseId) {
                links.push({
                    source: `course-${q.courseId}`,
                    target: nodeId,
                    color: '#A855F740'
                });
            }
        });
        // 4. Add Code Snippet Nodes & Links
        codeSnippets.forEach((cs) => {
            const nodeId = `code-${cs.id}`;
            nodes.push({
                id: nodeId,
                label: cs.title,
                type: 'CODE',
                color: '#F59E0B',
                size: 14,
                rawId: cs.id
            });
            if (cs.courseId) {
                links.push({
                    source: `course-${cs.courseId}`,
                    target: nodeId,
                    color: '#F59E0B40'
                });
            }
        });
        res.status(200).json({ nodes, links });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch graph data' });
    }
}
