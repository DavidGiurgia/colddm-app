// app/lib/ai/openai.js
import OpenAI from 'openai';

// Initializează clientul OpenAI cu cheia API din variabilele de mediu.
// Asigură-te că OPENAI_API_KEY este setat în fișierul .env.local
// și că nu este expus în frontend.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generează conținut text folosind modelul OpenAI GPT-4o.
 *
 * @param {string} prompt - Prompt-ul text pentru AI.
 * @param {object | null} schema - (Opțional) Schema pentru răspuns structurat (JSON), dacă este necesar.
 * Pentru MVP-ul de generare mesaje, probabil că nu va fi folosită direct aici,
 * dar este inclusă pentru flexibilitate viitoare.
 * @returns {Promise<string>} - Conținutul generat de AI.
 * @throws {Error} - Aruncă o eroare dacă apelul API eșuează.
 */
export async function generateWithOpenAI(prompt, schema = null) {
  try {
    // Construiește array-ul de mesaje pentru API-ul Chat Completions.
    // Un rol 'system' poate ghida comportamentul general al AI-ului.
    const messages = [
      { role: 'system', content: 'You are an expert cold outreach specialist for startups and indie founders. Your goal is to write highly effective and concise cold messages that get responses.' },
      { role: 'user', content: prompt },
    ];

    // Configurația pentru generarea conținutului.
    const completionConfig = {
      model: 'gpt-4o', // Folosim cel mai recent model GPT-4o pentru calitate și eficiență
      messages: messages,
      max_tokens: 700, // Limitează lungimea răspunsului pentru a controla costurile și relevanța
      n: 1, // Generează un singur răspuns (pe care îl vom parsa pentru multiple mesaje)
      temperature: 0.7, // Controlază "creativitatea" AI-ului. 0.7 e un echilibru bun.
    };

    // Dacă este furnizată o schemă, configurează AI-ul să răspundă în format JSON.
    // Acest lucru este util pentru răspunsuri structurate.
    if (schema) {
      completionConfig.response_format = { type: "json_object" };
      // Poți adăuga schema direct în prompt sau ca o instrucțiune suplimentară
      // în mesajul de sistem, în funcție de complexitatea schemei.
      // Pentru acest MVP, ne bazăm pe prompt-ul din ai-generator.js pentru formatare.
    }

    // Efectuează apelul către API-ul OpenAI.
    const completion = await openai.chat.completions.create(completionConfig);

    // Extrage conținutul generat.
    const generatedContent = completion.choices[0].message.content;

    // Returnează conținutul generat.
    return generatedContent;

  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
    // Aruncă o eroare pentru a fi gestionată la un nivel superior.
    throw new Error(`Failed to generate content with OpenAI: ${error.message}`);
  }
}
