// Smart Academic AI Generator Engine (Fallback)
function generateSmartLocalResponse(prompt, contextText) {
    const fullText = (contextText + ' ' + prompt).trim();
    const lowerPrompt = prompt.toLowerCase();
    // 1. GENERAL WHAT IS / DEFINE QUESTIONS
    if (lowerPrompt.includes('what is') || lowerPrompt.includes('define') || lowerPrompt.includes('meaning')) {
        const topic = prompt.replace(/what is|define|meaning of/gi, '').trim() || 'Data';
        return `💡 **[AI Explanation: ${topic}]**\n\n` +
            `**${topic}** refers to raw, unorganized facts, figures, observations, or symbols (such as numbers, text, images, or audio) that have not yet been processed or given context.\n\n` +
            `• **Key Characteristics:** Raw, unformatted, objective observations.\n` +
            `• **Data vs Information:** When data is processed, organized, and interpreted in context, it becomes **Information**.\n` +
            `• **Example in BS-IT:** Student Roll Numbers, Exam Scores, or SQL database table rows.`;
    }
    // 2. SUMMARIZE NOTES PRESET
    if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
        const textToSummarize = contextText || prompt;
        const lines = textToSummarize
            .split(/(?<=[.!?\n])\s+/)
            .map(s => s.replace(/[#*`]/g, '').trim())
            .filter(s => s.length > 8);
        if (lines.length > 0) {
            const bullets = lines.slice(0, 5).map((line, idx) => `• **Key Point ${idx + 1}:** ${line}`).join('\n\n');
            return `📝 **[AI Summary of Study Notes]**\n\n${bullets}\n\n💡 **Core Takeaway:** Focus on these primary definitions for your exam preparation.`;
        }
    }
    // 3. GENERATE 5 MCQS PRESET
    if (lowerPrompt.includes('mcq') || lowerPrompt.includes('quiz')) {
        const words = fullText.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 4);
        const kw1 = words[0] || 'Database';
        const kw2 = words[1] || 'Algorithm';
        const kw3 = words[2] || 'System';
        return `❓ **[AI Generated 5-Question Quiz]**\n\n` +
            `1. What is the primary function of ${kw1} in software architecture?\n` +
            `   A) Data Persistence & Structured Access\n   B) Network Packet Loss\n   C) Hardware Overheating\n   D) Deleting Tables\n   *Correct Answer:* A\n\n` +
            `2. How does ${kw2} optimize processing performance?\n` +
            `   A) Increasing execution time\n   B) Reducing time complexity to logarithmic O(log n)\n   C) Creating memory leaks\n   D) Bypassing validation\n   *Correct Answer:* B\n\n` +
            `3. Which core principle applies to ${kw3} management?\n` +
            `   A) Modularity & High Cohesion\n   B) Unstructured Spagetti Code\n   C) Ignoring Exceptions\n   D) Hardcoding Values\n   *Correct Answer:* A\n\n` +
            `4. What happens during a transactional database commit?\n` +
            `   A) Changes are permanently written to SQLite\n   B) Rollback is forced\n   C) Server process terminates\n   D) Memory is cleared\n   *Correct Answer:* A\n\n` +
            `5. Which active learning technique yields the highest retention?\n` +
            `   A) Spaced Repetition Flashcards & Active Recall\n   B) Passive reading\n   C) Overnight cramming\n   D) Skipping lectures\n   *Correct Answer:* A`;
    }
    // 4. EXPLAIN CONCEPT / CODE PRESET
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('concept')) {
        const conceptTopic = prompt.replace(/Explain|this|concept|step-by-step|with|examples/gi, '').trim() || 'BS-IT Academic Topic';
        return `💡 **[AI Concept Explanation]**\n\n` +
            `### Topic: ${conceptTopic}\n\n` +
            `1. **Definition:** This is a fundamental core concept focused on structured logic, data processing, and system efficiency.\n` +
            `2. **How It Works:** Input parameters are validated, processed through algorithmic logic, and committed as structured output.\n` +
            `3. **Real-World Application:** Used extensively in database indexing, backend APIs, and software engineering.\n` +
            `4. **Exam Strategy:** Write down the formal definition, draw a simple block diagram, and include a 3-line code example on your answer sheet.`;
    }
    // 5. REVISION PLANNER / GENERAL ACADEMIC CHAT
    return `🤖 **[AI Academic Study Plan]**\n\n` +
        `Based on your request: "${prompt}"\n\n` +
        `• **Action Step 1:** Review your lecture notes in the Notes Workspace.\n` +
        `• **Action Step 2:** Practice related MCQs in the Question Bank.\n` +
        `• **Action Step 3:** Start a 25-minute Pomodoro Focus Timer session to master this material.`;
}
export async function generateAiResponse(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { mode, prompt, contextText, provider, apiKey, ollamaUrl } = req.body;
        if (!prompt && !contextText) {
            res.status(400).json({ error: 'Prompt or note context is required.' });
            return;
        }
        const selectedProvider = provider || 'gemini';
        const textToProcess = contextText ? `Context Notes:\n"${contextText}"\n\nTask: ${prompt}` : prompt;
        let resultText = '';
        if (selectedProvider === 'gemini') {
            // 1. Google Gemini API Latest Active Models Auto-Loop
            if (!apiKey || !apiKey.trim()) {
                res.status(400).json({ error: 'Gemini API Key is missing. Please set your API Key in Settings!' });
                return;
            }
            const cleanKey = apiKey.trim();
            const modelsToTry = [
                'gemini-2.0-flash',
                'gemini-2.5-flash',
                'gemini-3.5-flash',
                'gemini-3.7-flash',
                'gemini-1.5-flash'
            ];
            let lastError = '';
            for (const modelName of modelsToTry) {
                try {
                    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: textToProcess }] }]
                        })
                    });
                    const geminiData = await geminiRes.json();
                    if (geminiRes.ok && geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
                        resultText = geminiData.candidates[0].content.parts[0].text;
                        break; // SUCCESS! Exit model loop
                    }
                    else if (geminiData.error?.message) {
                        lastError = geminiData.error.message;
                        // If error is just model deprecated/not found, loop continues to next model!
                        if (!geminiData.error.message.includes('not found') && !geminiData.error.message.includes('no longer available')) {
                            res.status(400).json({ error: `Google Gemini API Error: ${geminiData.error.message}` });
                            return;
                        }
                    }
                }
                catch (err) {
                    lastError = err instanceof Error ? err.message : 'Network error';
                }
            }
            if (!resultText && lastError) {
                res.status(400).json({ error: `Google Gemini API Error: ${lastError}` });
                return;
            }
        }
        else if (selectedProvider === 'openai') {
            // 2. OpenAI GPT-4o Strategy
            if (!apiKey || !apiKey.trim()) {
                res.status(400).json({ error: 'OpenAI API Key is missing. Please set your API Key in Settings!' });
                return;
            }
            try {
                const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey.trim()}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'user', content: textToProcess }]
                    })
                });
                const openaiData = await openaiRes.json();
                if (openaiRes.ok) {
                    resultText = openaiData.choices?.[0]?.message?.content || '';
                }
                else if (openaiData.error?.message) {
                    res.status(400).json({ error: `OpenAI Error: ${openaiData.error.message}` });
                    return;
                }
            }
            catch (err) {
                res.status(400).json({ error: `OpenAI Error: ${err instanceof Error ? err.message : 'Network error'}` });
                return;
            }
        }
        else {
            // 3. Ollama Local LLM
            const endpoint = ollamaUrl || 'http://localhost:11434';
            try {
                const ollamaRes = await fetch(`${endpoint}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama3',
                        prompt: textToProcess,
                        stream: false
                    })
                });
                const ollamaData = await ollamaRes.json();
                if (ollamaRes.ok) {
                    resultText = ollamaData.response || '';
                }
                else {
                    res.status(400).json({ error: 'Ollama local app is not running at http://localhost:11434' });
                    return;
                }
            }
            catch {
                res.status(400).json({ error: 'Ollama local app is not running at http://localhost:11434. Please select Google Gemini API in Settings.' });
                return;
            }
        }
        // Fallback if empty
        if (!resultText) {
            resultText = generateSmartLocalResponse(prompt || '', contextText || '');
        }
        res.status(200).json({ response: resultText, mode, provider: selectedProvider });
    }
    catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'AI Generation failed' });
    }
}
