import { generateContentWithAi } from '@/lib/ai/ai-generator';
import { buildPrompt } from '@/lib/prompts/generate-dm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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
    return NextResponse.json({
      success: true,
      messages: messages,
      currentUsage: profile.messages_used_this_month + 1,
      limit: profile.messages_limit_per_month
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