// pages/api/generate-dm.js
import { generateContentWithAi } from '@/lib/ai/ai-generator';
import { buildPrompt } from '@/lib/prompts/generate-dm';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const supabase = createServerSupabaseClient();

export default async function handler(req, res) {
  // Ensure only POST requests are accepted
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract form data from the request body
  const { recipient, goal, product, channel, tone, userContext } = req.body;

  // Basic input validation
  if (!recipient || !goal || !product || !channel || !tone) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  // Get user ID for usage tracking and profile updates
  // This assumes you have session management set up to get the user's token/ID
  // For Supabase, you'd typically get the user from the request context if using server-side auth,
  // or pass the session token from the client. For MVP, we'll get it directly from auth.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    // 1. Check User's Plan and Usage Limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_plan, messages_used_this_month, messages_limit_per_month') // Assuming these columns exist
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ message: 'Failed to retrieve user profile.' });
    }

    // For free users, check if they've exceeded their limit
    if (profile.current_plan === 'free' && profile.messages_used_this_month >= profile.messages_limit_per_month) {
      return res.status(403).json({ message: 'You have exceeded your message generation limit for this month. Please upgrade to Pro for unlimited access!' });
    }

    // 2. Build the AI Prompt
    // The buildPrompt function will be in app/lib/prompts/core-prompt.js
    const aiPrompt = buildPrompt({ recipient, goal, product, channel, tone, userContext });

    // 3. Call the AI Generation Function
    // This uses your ai-generator.js which defaults to OpenAI GPT-4o
    const generatedContent = await generateContentWithAi(aiPrompt);

    // 4. Parse the AI's Response
    // This parsing logic must match the output format requested in buildPrompt
    const messages = generatedContent
      .split('---MESSAGE ')
      .filter(block => block.trim() !== '')
      .map(block => {
        const lines = block.split('\n');
        const messageNumber = lines[0].replace('---', '').trim();
        const content = lines.slice(1).join('\n').trim();
        let subject = null;

        // If it's an email, try to extract the subject line
        if (channel === 'Email' && content.startsWith('[Subject:')) {
          const subjectMatch = content.match(/\[Subject:\s*(.*?)\]\n(.*)/s);
          if (subjectMatch && subjectMatch[1]) {
            subject = subjectMatch[1].trim();
            return { number: messageNumber, content: subjectMatch[2].trim(), subject };
          }
        }
        return { number: messageNumber, content: content };
      });

    // 5. Update User Usage (if free plan)
    if (profile.current_plan === 'free') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ messages_used_this_month: profile.messages_used_this_month + 1 })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating message usage:', updateError);
        // Don't block the user, but log the error
      }
    }

    // 6. Return the Generated Messages to the Frontend
    res.status(200).json({ success: true, messages: messages, currentUsage: profile.messages_used_this_month + 1, limit: profile.messages_limit_per_month });

  } catch (error) {
    console.error('Error generating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate messages. Please try again.',
      error: error.message,
    });
  }
}
