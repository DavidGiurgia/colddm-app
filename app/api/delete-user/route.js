import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = createServerSupabaseClient();
  
  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // First delete profile data
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (deleteProfileError) {
      console.error('Error deleting profile:', deleteProfileError)
      // Continue anyway - we want to try to delete the auth user even if profile deletion fails
    }

    // Then delete the auth user (requires service role key)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration - missing service role key' },
        { status: 500 }
      )
    }

    const adminAuthClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey
    ).auth.admin

    const { error: deleteUserError } = await adminAuthClient.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError)
      return NextResponse.json(
        { error: deleteUserError.message },
        { status: 500 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )

  } catch (err) {
    console.error('Error in account deletion:', err)
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}