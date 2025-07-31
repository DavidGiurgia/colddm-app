import { generateContentWithAi } from '@/lib/ai/ai-generator';
import { buildPrompt } from '@/lib/prompts/generate-dm'; // Assuming this is your prompt builder
import { createServerSupabaseClient } from '@/lib/supabase/server'; // Or createClient if using App Router directly
import { NextResponse } from 'next/server';

// Note: For App Router, you typically import createClient from '@supabase/supabase-js'
// and initialize it within the route handler, or use a helper that does it.
// createServerSupabaseClient is common for Pages Router.
// I'm keeping createServerSupabaseClient as per your provided code, assuming your setup handles it.
const supabase = createServerSupabaseClient();

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { recipient, goal, product, channel, tone, userContext } = body;

    // Basic input validation
    if (!recipient || !goal || !product || !channel || !tone) {
      return NextResponse.json(
        { message: 'Missing required parameters.' },
        { status: 400 }
      );
    }

    // Get user ID for usage tracking and profile updates
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Authentication required.' },
        { status: 401 }
      );
    }

    // 1. Check User's Plan and Usage Limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_plan, messages_used_this_month, messages_limit_per_month')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { message: 'Failed to retrieve user profile.' },
        { status: 500 }
      );
    }

    // For free users, check if they've exceeded their limit
    if (profile.current_plan === 'free' && profile.messages_used_this_month >= profile.messages_limit_per_month) {
      return NextResponse.json(
        { message: 'You have exceeded your message generation limit for this month. Please upgrade to Pro for unlimited access!' },
        { status: 403 }
      );
    }

    // 2. Build the AI Prompt
    const aiPrompt = buildPrompt({ recipient, goal, product, channel, tone, userContext });

    // 3. Call the AI Generation Function
    const generatedContent = await generateContentWithAi(aiPrompt);

    // 4. Parse the AI's Response
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

    // --- AICI ESTE LINIA DE SALVARE ÎN `generated_messages` ---
    // 5. Save the generated messages and input data to the 'generated_messages' table
    const { data: insertedMessageData, error: insertError } = await supabase
      .from('generated_messages')
      .insert({
        user_id: user.id,
        input_data: { recipient, goal, product, channel, tone, userContext }, // Store the original form data as JSONB
        output_messages: messages, // Store the parsed array of generated messages as JSONB
        channel: channel,
        tone: tone,
        feedback_rating: null, // Initially, no feedback has been provided
      })
      .select('id'); // Important: select the ID to return it to the frontend

    if (insertError || !insertedMessageData || insertedMessageData.length === 0) {
      console.error('Error saving generated message to DB:', insertError?.message || 'No data returned on insert.');
      // Don't block the user, but log the error.
    }

    const generatedMessageId = insertedMessageData ? insertedMessageData[0].id : null;

    // 6. Update User Usage (if free plan)
    let updatedMessagesUsed = profile.messages_used_this_month;
    if (profile.current_plan === 'free') {
      updatedMessagesUsed = profile.messages_used_this_month + 1;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ messages_used_this_month: updatedMessagesUsed })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating message usage:', updateError);
        // Don't block the user, but log the error
      }
    }

    // 7. Return the Generated Messages to the Frontend
    return NextResponse.json({
      success: true,
      messages: messages,
      currentUsage: updatedMessagesUsed,
      limit: profile.messages_limit_per_month,
      generatedMessageId: generatedMessageId // Return the ID of the newly saved message batch
    });

  } catch (error) {
    console.error('Error generating message:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate messages. Please try again.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
