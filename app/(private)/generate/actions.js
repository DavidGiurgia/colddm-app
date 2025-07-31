// pages/api/generate-dm.js
import { generateContentWithAi } from '@/lib/ai/ai-generator';
import { buildPrompt } from '@/lib/prompts/generate-dm';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const supabase = createServerSupabaseClient();

export default async function handler(req, res) {
  // Ensure only POST requests are accepted for security and data submission
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Extract form data from the request body
  const { recipient, goal, product, channel, tone, userContext } = req.body;

  // Basic input validation: ensure all required fields are present
  if (!recipient || !goal || !product || !channel || !tone) {
    return res.status(400).json({ message: 'Missing required parameters. Please fill in all fields.' });
  }

  // Authenticate user to link generation to a specific user and track usage
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    // If no user is authenticated, respond with an authentication required error
    return res.status(401).json({ message: 'Authentication required. Please log in to generate messages.' });
  }

  try {
    // 1. Fetch User's Plan and Usage Limits from the 'profiles' table
    // This determines if the user is 'free' or 'pro' and how many messages they have left.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_plan, messages_used_this_month, messages_limit_per_month')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError?.message || 'Profile not found.');
      return res.status(500).json({ message: 'Failed to retrieve user profile. Please try again.' });
    }

    // 2. Enforce Usage Limits for 'free' plan users
    if (profile.current_plan === 'free' && profile.messages_used_this_month >= profile.messages_limit_per_month) {
      // If a free user has exceeded their limit, return a 403 Forbidden status
      return res.status(403).json({ message: 'You have used all your free message generations for this month. Upgrade to Pro for unlimited access!' });
    }

    // 3. Build the AI Prompt using the sophisticated 'buildPrompt' function
    // This function injects all the context, channel-specific strategies, and tone.
    const aiPrompt = buildPrompt({ recipient, goal, product, channel, tone, userContext });

    // 4. Call the AI Generation Function
    // This uses your `ai-generator.js` which is configured to use OpenAI GPT-4o by default.
    const generatedContent = await generateContentWithAi(aiPrompt);

    // 5. Parse the AI's Response based on the expected output format from 'buildPrompt'
    // This ensures you correctly extract each message variant and its subject (if email).
    const messages = generatedContent
      .split('---MESSAGE ') // Split the string by the defined message separator
      .filter(block => block.trim() !== '') // Remove any empty blocks resulting from split
      .map(block => {
        const lines = block.split('\n');
        const messageNumber = lines[0].replace('---', '').trim(); // Extract message number
        const content = lines.slice(1).join('\n').trim(); // Remaining lines are the message content
        let subject = null;

        // Special handling for Email channel to extract the Subject Line
        if (channel === 'Email' && content.startsWith('[Subject:')) {
          const subjectMatch = content.match(/\[Subject:\s*(.*?)\]\n(.*)/s);
          if (subjectMatch && subjectMatch[1]) {
            subject = subjectMatch[1].trim();
            // Return content without the subject line prefix for cleaner display in UI
            return { number: messageNumber, content: subjectMatch[2].trim(), subject };
          }
        }
        return { number: messageNumber, content: content };
      });

    // 6. Save the generated messages and input data to the 'generated_messages' table
    // This is crucial for your feedback loop and future "saved messages" feature.
    const { error: insertError } = await supabase
      .from('generated_messages')
      .insert({
        user_id: user.id,
        input_data: { recipient, goal, product, channel, tone, userContext }, // Store the original form data as JSONB
        output_messages: messages, // Store the parsed array of generated messages as JSONB
        channel: channel,
        tone: tone,
        feedback_rating: null, // Initially, no feedback has been provided
      });

    if (insertError) {
      console.error('Error saving generated message to database:', insertError?.message);
      // Log the error, but do not block the user from receiving their messages.
      // This is a non-critical error for the immediate user experience.
    }

    // 7. Update User Usage in the 'profiles' table (only for 'free' plan users)
    let updatedMessagesUsed = profile.messages_used_this_month;
    if (profile.current_plan === 'free') {
      updatedMessagesUsed = profile.messages_used_this_month + 1;
      const { error: updateUsageError } = await supabase
        .from('profiles')
        .update({ messages_used_this_month: updatedMessagesUsed })
        .eq('id', user.id);

      if (updateUsageError) {
        console.error('Error updating message usage in profiles table:', updateUsageError?.message);
        // Log the error, but do not block the user.
      }
    }

    // 8. Return the Generated Messages and updated usage info to the Frontend
    res.status(200).json({
      success: true,
      messages: messages,
      currentUsage: updatedMessagesUsed,
      limit: profile.messages_limit_per_month
    });

  } catch (error) {
    console.error('Error during message generation process:', error?.message || error);
    // Provide a generic error message to the user for unexpected issues
    res.status(500).json({
      success: false,
      message: 'Failed to generate messages. An unexpected error occurred. Please try again.',
      error: error.message,
    });
  }
}
