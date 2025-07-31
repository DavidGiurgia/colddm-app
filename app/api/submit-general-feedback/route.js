// app/api/submit-general-feedback/route.js

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Handles POST requests to submit feedback.
 * @param {Request} request - The incoming request object.
 * @returns {Promise<Response>} - A JSON response indicating success or failure.
 */
export async function POST(request) {
    const supabase = createServerSupabaseClient();

    try {
        // Parse the JSON body from the request.
        const { feedbackType, message, email, userId } = await request.json();

        // Basic validation to ensure the message is not empty.
        if (!message) {
            return NextResponse.json({ message: 'Message is required.' }, { status: 400 });
        }

        // Insert the feedback data into the 'general_feedback' table.
        // The `user_id` can be null for unauthenticated users, and the `email`
        // is used as a fallback contact method.
        const { data, error } = await supabase
            .from('general_feedback')
            .insert([
                {
                    user_id: userId,
                    email: email,
                    feedback_type: feedbackType,
                    message: message,
                },
            ]);

        // If there's an error from Supabase, return a server error response.
        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ message: 'Failed to submit feedback.', error: error.message }, { status: 500 });
        }

        // Return a successful response.
        return NextResponse.json({ message: 'Feedback submitted successfully.', data }, { status: 200 });

    } catch (err) {
        console.error('General error in feedback API:', err);
        // Catch any other unexpected errors and return a generic server error.
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
