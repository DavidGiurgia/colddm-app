// app/lib/ai/ai-generator.js
import { generateWithGemini } from "./gemini";
import { generateWithGroq } from "./groq";
import { generateWithOpenAI } from "./openai"; // Importăm noua funcție OpenAI

// Setăm provider-ul AI implicit la 'openai' pentru MVP, conform discuției.
// Această variabilă poate fi ulterior configurată prin variabile de mediu
// sau selectată din UI pentru planurile Pro.
const ACTIVE_AI_PROVIDER = 'groq'; // Schimbat de la 'groq' la 'openai'

/**
 * Generează conținut text folosind provider-ul AI activ configurat.
 *
 * @param {string} prompt - Prompt-ul text pentru AI.
 * @param {object | null} schema - (Opțional) Schema pentru răspuns structurat (JSON).
 * @returns {Promise<string>} - Conținutul generat de AI.
 * @throws {Error} - Aruncă o eroare dacă provider-ul AI este invalid sau dacă generarea eșuează.
 */
export async function generateContentWithAi(prompt, schema = null) {
    console.log(`Using ${ACTIVE_AI_PROVIDER} for AI generation...`); // Log pentru a vedea ce provider este folosit

    if (ACTIVE_AI_PROVIDER === 'groq') {
        return generateWithGroq(prompt, schema);
    } else if (ACTIVE_AI_PROVIDER === 'gemini') {
        return generateWithGemini(prompt, schema);
    } else if (ACTIVE_AI_PROVIDER === 'openai') { // Adăugăm condiția pentru OpenAI
        return generateWithOpenAI(prompt, schema);
    } else {
        // Mesaj de eroare actualizat pentru a include 'openai'
        throw new Error("Invalid AI provider configured. Set ACTIVE_AI_PROVIDER to 'gemini', 'groq', or 'openai'.");
    }
}
