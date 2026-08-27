import { prisma } from '../db';
// 1. GET UNIVERSITY PROFILE
export async function getUniversityProfile(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        let profile = await prisma.universityProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            profile = await prisma.universityProfile.create({
                data: {
                    userId,
                    universityName: 'My University',
                    department: 'Department of IT',
                    degreeProgram: 'BS Information Technology',
                    section: 'BSIT-4A',
                    totalRequiredCredits: 130,
                    earnedCredits: 64,
                    targetCgpa: 4.00
                }
            });
        }
        res.status(200).json({ profile });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch university profile' });
    }
}
// 2. UPDATE UNIVERSITY PROFILE
export async function updateUniversityProfile(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { universityName, department, degreeProgram, section, rollNumber, studentId, batch, academicSession, academicAdvisor, totalRequiredCredits, earnedCredits, targetCgpa } = req.body;
        const existingProfile = await prisma.universityProfile.findUnique({
            where: { userId }
        });
        const updatedProfile = await prisma.universityProfile.upsert({
            where: { userId },
            update: {
                universityName: universityName !== undefined ? universityName : existingProfile?.universityName,
                department: department !== undefined ? department : existingProfile?.department,
                degreeProgram: degreeProgram !== undefined ? degreeProgram : existingProfile?.degreeProgram,
                section: section !== undefined ? section : existingProfile?.section,
                rollNumber: rollNumber !== undefined ? rollNumber : existingProfile?.rollNumber,
                studentId: studentId !== undefined ? studentId : existingProfile?.studentId,
                batch: batch !== undefined ? batch : existingProfile?.batch,
                academicSession: academicSession !== undefined ? academicSession : existingProfile?.academicSession,
                academicAdvisor: academicAdvisor !== undefined ? academicAdvisor : existingProfile?.academicAdvisor,
                totalRequiredCredits: totalRequiredCredits ? Number(totalRequiredCredits) : existingProfile?.totalRequiredCredits,
                earnedCredits: earnedCredits ? Number(earnedCredits) : existingProfile?.earnedCredits,
                targetCgpa: targetCgpa ? Number(targetCgpa) : existingProfile?.targetCgpa
            },
            create: {
                userId,
                universityName: universityName || 'My University',
                department: department || 'Department of IT',
                degreeProgram: degreeProgram || 'BS Information Technology',
                section: section || 'BSIT-4A',
                rollNumber: rollNumber || '',
                studentId: studentId || '',
                batch: batch || '',
                academicSession: academicSession || '',
                academicAdvisor: academicAdvisor || '',
                totalRequiredCredits: totalRequiredCredits ? Number(totalRequiredCredits) : 130,
                earnedCredits: earnedCredits ? Number(earnedCredits) : 64,
                targetCgpa: targetCgpa ? Number(targetCgpa) : 4.00
            }
        });
        res.status(200).json({ message: 'University profile updated!', profile: updatedProfile });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update university profile' });
    }
}
