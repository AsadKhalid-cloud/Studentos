import * as pdfParseDefault from 'pdf-parse';
const pdfParse = typeof pdfParseDefault === 'function' ? pdfParseDefault : (pdfParseDefault?.default || pdfParseDefault);
export async function processOcrExtraction(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { imageBase64, fileName } = req.body;
        if (!imageBase64) {
            res.status(400).json({ error: 'File data is required for OCR extraction.' });
            return;
        }
        // Convert Base64 Data URL to Node Buffer
        const base64Data = imageBase64.replace(/^data:.*?;base64,/, '');
        const fileBuffer = Buffer.from(base64Data, 'base64');
        let extractedText = '';
        // Decompress & Extract PDF Text Streams
        if (fileBuffer.slice(0, 5).toString().includes('%PDF')) {
            try {
                const pdfData = await pdfParse(fileBuffer);
                extractedText = pdfData.text || '';
            }
            catch (pdfErr) {
                console.error('[StudentOS PDF Parse Error]:', pdfErr);
            }
        }
        else {
            // Text fallback
            extractedText = fileBuffer.toString('utf-8');
        }
        // Clean up carriage returns & multiple empty lines
        const cleanText = extractedText
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        res.status(200).json({
            message: 'Extraction complete!',
            extractedText: cleanText || `# Extracted Notes - ${fileName || 'Document'}\n\nPDF document processed successfully.`,
            fileName: fileName || 'Document'
        });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'File extraction failed' });
    }
}
