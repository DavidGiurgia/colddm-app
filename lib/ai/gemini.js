import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Leave empty for Canvas environment to inject
let geminiModelInstance = null;

function getGeminiModel() {
    if (!geminiModelInstance) {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        geminiModelInstance = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    return geminiModelInstance;
}

export async function generateWithGemini(prompt, schema = null) {
    console.log("Using Gemini for AI generation...");
    
    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };

    if (schema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: schema,
        };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API call failed with status ${response.status}: ${errorBody}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            if (schema) {
                try {
                    return JSON.parse(text);
                } catch (parseError) {
                    console.error("Failed to parse JSON response from Gemini:", text, parseError);
                    throw new Error("Invalid JSON response from Gemini AI.");
                }
            }
            return text;
        } else {
            console.error("Unexpected Gemini AI response structure:", result);
            throw new Error("Gemini AI response structure is unexpected or content is missing.");
        }
    } catch (error) {
        console.error("Error during Gemini AI content generation:", error);
        throw error;
    }
}