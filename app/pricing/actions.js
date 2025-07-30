// app/pricing/interested/actions.js
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Define the schema for validating incoming form data
const interestSchema = z.object({
  email: z.string().email('Invalid email address.'),
  message: z.string().max(500, 'Message cannot exceed 500 characters.').optional(),
});

/**
 * Submits user interest for the Pro Plan to the database.
 * @param {Object} formData - The form data containing email and message.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function submitInterest(formData) {
  const validation = interestSchema.safeParse(formData);

  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  const { email, message } = validation.data;
  const supabase = createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('pro_plan_interests') // Ensure you have this table in Supabase
      .insert([
        { email, message, created_at: new Date().toISOString() },
      ]);

    if (error) {
      console.error('Error submitting interest to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Server action error during interest submission:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
