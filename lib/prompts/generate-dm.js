// Acest prompt va fi construit dinamic în pages/api/generate-dm.js
// și trimis către generateContentWithAi(prompt, ...)

export const buildPrompt = ({ recipient, goal, product, channel, tone, userContext = '' }) => {
  // Secțiunea 1: Rolul și Obiectivul AI-ului
  let prompt = `You are an expert cold outreach specialist and a master of concise, effective communication.
  Your primary goal is to generate highly personalized and compelling cold messages that consistently elicit a response.
  You understand the nuances of different communication channels and tones, and your messages are never generic or salesy.
  You excel at weaving in key product benefits naturally without sounding like a sales pitch.
  
  ---
  `;
  
  // Secțiunea 2: Contextul Utilizatorului (Input-urile Formularului)
  prompt += `**Scenario Details:**
  - **Recipient Type:** ${recipient}
  - **Desired Goal (from recipient):** ${goal}
  - **Your Product (1-2 sentences):** ${product}
  - **Communication Channel:** ${channel}
  - **Desired Tone:** ${tone}
  `;
  
  if (userContext) {
    prompt += `- **Additional User Context:** ${userContext}\n`;
  }
  
  prompt += `
  ---
  `;
  
  // Secțiunea 3: Reguli și Constraint-uri Specifice
  prompt += `**Instructions for Message Generation:**
  - Generate exactly **3 distinct message variants**.
  - Each message must have a **clear, low-commitment Call to Action (CTA)** that aligns with the "Desired Goal" (e.g., "Are you open to a quick chat?", "Would you like to learn more?").
  - The messages should feel natural, authentic, and avoid sounding desperate, overly formal, or overtly salesy.
  - **Prioritize getting a response** over selling immediately.
  - Integrate the "Your Product" description smoothly and concisely, **highlighting unique benefits like "no account/app needed" or "anonymous options" where relevant.**
  
  **Channel-Specific Guidelines:**
  `;
  
  if (channel === 'Email') {
    prompt += `- For **Email**: Include a concise, engaging subject line. The body should be professional yet approachable.
    `;
  } else if (channel === 'Twitter/X DM') {
    prompt += `- For **Twitter/X DM**: Be extremely concise, under 280 characters. Get straight to the point.
    `;
  } else if (channel === 'LinkedIn') {
    prompt += `- For **LinkedIn Message**: Focus on building a connection, offering mutual value, or making a brief, relevant ask. Maintain a professional yet friendly demeanor.
    `;
  }
  
  prompt += `
  ---
  `;
  
  // Secțiunea 4: Formatul de Output (CRUCIAL pentru parsare)
  prompt += `**Output Format:**
  Present the 3 generated messages as follows, each clearly separated by "---MESSAGE [Number]---".
  If the channel is Email, include the Subject Line on a new line after "---MESSAGE [Number]---".
  
  Example Output Structure:
  ---MESSAGE 1---
  [Subject: Your Subject Line (for Email)]
  [First message variant content]
  ---MESSAGE 2---
  [Subject: Your Subject Line (for Email)]
  [Second message variant content]
  ---MESSAGE 3---
  [Subject: Your Subject Line (for Email)]
  [Third message variant content]
  `;
  
  return prompt;
};
