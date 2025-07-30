// lib/groq.ts

export const generateWithGroq = async (prompt, schema = null) => {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: '',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    console.error(`Groq API Error: ${res.status} ${res.statusText}`);
    const errorText = await res.text();
    throw new Error(`Groq API failed: ${errorText}`);
  }

  const data = await res.json();

  return data.choices?.[0]?.message?.content?.trim() || '';
};
