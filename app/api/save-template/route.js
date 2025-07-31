import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const supabase = createServerSupabaseClient();

export async function POST(request) {
  // Ensure only POST requests are accepted
  if (request.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  // Extract data from the request body
  const { name, content, channel, tone, originalGeneratedMessageId } = await request.json();

  // Basic input validation
  if (!name || !content || !channel || !tone) {
    return NextResponse.json({ message: 'Missing required parameters for template saving.' }, { status: 400 });
  }

  // Get user ID from the Supabase session
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: 'Authentication required. Please log in to save templates.' }, { status: 401 });
  }

  try {
    // Insert the new template into the 'saved_templates' table
    const { data, error: insertError } = await supabase
      .from('saved_templates')
      .insert({
        user_id: user.id,
        name: name,
        content: content,
        channel: channel,
        tone: tone,
        original_generated_message_id: originalGeneratedMessageId, // Link to the original generation
      })
      .select(); // Select the inserted data to confirm success

    if (insertError) {
      console.error('Error saving template to DB:', insertError?.message);
      return NextResponse.json({ message: `Failed to save template: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Template saved successfully!',
      template: data[0] // Return the first (and only) inserted template
    });

  } catch (error) {
    console.error('Error during template saving process:', error?.message || error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred while saving the template. Please try again.',
      error: error.message,
    });
  }
}
