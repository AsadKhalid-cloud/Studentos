import { prisma } from '../db';
// 1. GET ALL USER NOTES (With Filtering & Search)
export async function getNotes(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { courseId, category, search, isPinned, isFavorite } = req.query;
        const whereClause = { userId };
        if (courseId)
            whereClause.courseId = String(courseId);
        if (category)
            whereClause.category = String(category);
        if (isPinned === 'true')
            whereClause.isPinned = true;
        if (isFavorite === 'true')
            whereClause.isFavorite = true;
        if (search) {
            const searchTerm = String(search);
            whereClause.OR = [
                { title: { contains: searchTerm } },
                { markdownText: { contains: searchTerm } },
                { category: { contains: searchTerm } }
            ];
        }
        const notes = await prisma.note.findMany({
            where: whereClause,
            include: {
                course: {
                    select: { code: true, name: true, color: true }
                }
            },
            orderBy: [
                { isPinned: 'desc' },
                { updatedAt: 'desc' }
            ]
        });
        res.status(200).json({ notes });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch notes' });
    }
}
// 2. CREATE NEW RICH NOTE
export async function createNote(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { title, contentJson, markdownText, category, courseId, color } = req.body;
        if (!title) {
            res.status(400).json({ error: 'Note title is required.' });
            return;
        }
        const newNote = await prisma.note.create({
            data: {
                userId,
                title,
                contentJson: contentJson || '',
                markdownText: markdownText || '',
                category: category || 'General',
                color: color || '#3B82F6',
                courseId: courseId ? String(courseId) : null
            },
            include: {
                course: {
                    select: { code: true, name: true, color: true }
                }
            }
        });
        res.status(201).json({ message: 'Note created successfully!', note: newNote });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create note' });
    }
}
// 3. UPDATE EXISTING NOTE
export async function updateNote(req, res) {
    try {
        const userId = req.user?.userId;
        const noteId = String(req.params.id);
        const { title, contentJson, markdownText, category, courseId, color, isPinned, isFavorite, isLocked } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Verify ownership
        const existingNote = await prisma.note.findFirst({
            where: { id: noteId, userId }
        });
        if (!existingNote) {
            res.status(404).json({ error: 'Note not found or access denied.' });
            return;
        }
        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: {
                title: title !== undefined ? title : existingNote.title,
                contentJson: contentJson !== undefined ? contentJson : existingNote.contentJson,
                markdownText: markdownText !== undefined ? markdownText : existingNote.markdownText,
                category: category !== undefined ? category : existingNote.category,
                courseId: courseId !== undefined ? (courseId ? String(courseId) : null) : existingNote.courseId,
                color: color !== undefined ? color : existingNote.color,
                isPinned: isPinned !== undefined ? isPinned : existingNote.isPinned,
                isFavorite: isFavorite !== undefined ? isFavorite : existingNote.isFavorite,
                isLocked: isLocked !== undefined ? isLocked : existingNote.isLocked
            },
            include: {
                course: {
                    select: { code: true, name: true, color: true }
                }
            }
        });
        res.status(200).json({ message: 'Note updated successfully!', note: updatedNote });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update note' });
    }
}
// 4. DELETE NOTE
export async function deleteNote(req, res) {
    try {
        const userId = req.user?.userId;
        const noteId = String(req.params.id);
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const existingNote = await prisma.note.findFirst({
            where: { id: noteId, userId }
        });
        if (!existingNote) {
            res.status(404).json({ error: 'Note not found or access denied.' });
            return;
        }
        await prisma.note.delete({
            where: { id: noteId }
        });
        res.status(200).json({ message: 'Note deleted successfully!' });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete note' });
    }
}
// 5. TOGGLE PIN STATUS
export async function togglePinNote(req, res) {
    try {
        const userId = req.user?.userId;
        const noteId = String(req.params.id);
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const existingNote = await prisma.note.findFirst({
            where: { id: noteId, userId }
        });
        if (!existingNote) {
            res.status(404).json({ error: 'Note not found.' });
            return;
        }
        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: { isPinned: !existingNote.isPinned }
        });
        res.status(200).json({ note: updatedNote });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to toggle pin' });
    }
}
// 6. TOGGLE FAVORITE STATUS
export async function toggleFavoriteNote(req, res) {
    try {
        const userId = req.user?.userId;
        const noteId = String(req.params.id);
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const existingNote = await prisma.note.findFirst({
            where: { id: noteId, userId }
        });
        if (!existingNote) {
            res.status(404).json({ error: 'Note not found.' });
            return;
        }
        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: { isFavorite: !existingNote.isFavorite }
        });
        res.status(200).json({ note: updatedNote });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to toggle favorite' });
    }
}
