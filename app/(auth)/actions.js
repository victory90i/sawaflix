"use server";

import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signInWithPassword(formData) {
  let targetPath = '/dashboard';
  try {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    const isDev = process.env.NODE_ENV === 'development';
    const fallbackUrl = isDev ? 'http://localhost:5000' : 'https://sawaflix-backend.onrender.com';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;
    const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

    console.log(`🟡 Logging in via backend: ${email} at ${cleanBackendUrl}`);

    const res = await fetch(`${cleanBackendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.toString().trim(),
        password: password.toString()
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.error('🔴 Backend returned non-JSON response. Status:', res.status);
      return { error: 'Could not reach the authentication service. Please try again later.' };
    }

    const result = await res.json();

    if (!res.ok) {
      console.error('🔴 Backend login error:', result);
      return { error: result.error || result.message || 'Invalid email or password. Please try again.' };
    }

    const { session, role, isAuthorize } = result;

    if (!session?.access_token || !session?.refresh_token) {
      return { error: 'Authentication failed. No session returned.' };
    }

    const supabase = await createClient();

    // Set the session in Supabase client
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (sessionError) {
      console.error('🔴 Supabase setSession error:', sessionError.message);
      return { error: 'Failed to establish session. Please try again.' };
    }

    console.log('🟢 Login successful, role:', role, 'isAuthorize:', isAuthorize);

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    if (role === 'admin') revalidatePath('/admin');

    // Determine redirect path
    let redirectTo = role === 'admin' ? '/admin' : '/dashboard';

    // If not authorized, redirect to waiting list
    if (isAuthorize === false) {
      redirectTo = '/waiting-list';
    }

    return {
      success: true,
      message: 'Login successful',
      role: role,
      isAuthorize: isAuthorize,
      redirectTo: redirectTo
    };

  } catch (error) {
    console.error('🔴 Unexpected sign in error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signUpWithPassword(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const username = formData.get('username');
  const category = formData.get('category');
  const phone = formData.get('phone');

  // 1. Basic Validation
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long' };
  }

  try {
    const supabase = await createClient();

    const emailStr = email?.toString() || "";
    const userMetadata = {
      username: username || emailStr.split('@')[0],
      category: category || 'client',
      phone: phone || null,
    };

    const { data, error } = await supabase.auth.signUp({
      email: email.toString().trim(),
      password: password.toString(),
      options: {
        data: userMetadata,
      },
    });

    if (error) {
      console.error('🔴 Sign up error:', error.message);
      let userMessage = error.message;

      if (error.message.includes('already registered')) {
        userMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message.includes('invalid email')) {
        userMessage = 'Please enter a valid email address.';
      }
      return { error: userMessage };
    }

    console.log('🟢 Auth account created for:', email);
    console.log('ℹ️ Public profile creation is being handled by SQL Trigger.');

  } catch (error) {
    console.error('🔴 Unexpected sign up error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  redirect(`/verify-otp?email=${encodeURIComponent(email.toString().trim())}`);
}

export async function resetPassword(formData) {
  try {
    let email;

    // Handle different input formats
    if (formData instanceof FormData) {
      email = formData.get('email');
    } else if (typeof formData === 'object' && formData.email) {
      email = formData.email;
    } else if (typeof formData === 'string') {
      email = formData;
    }

    if (!email) {
      return { error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toString().trim())) {
      return { error: 'Please enter a valid email address.' };
    }

    // Smart environment routing: Use localhost:5000 in dev, fallback to Render in prod
    const isDev = process.env.NODE_ENV === 'development';
    const fallbackUrl = isDev ? 'http://localhost:5000' : 'https://sawaflix-backend.onrender.com';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;
    const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

    console.log(`🟡 Sending password reset via backend to: ${email} at ${cleanBackendUrl}`);

    const res = await fetch(`${cleanBackendUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toString().trim() }),
    });

    // Guard: Backend might return an HTML error page (e.g., 404 if not deployed, or 502)
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.error('🔴 Backend returned non-JSON response. Status:', res.status);
      return { error: 'Could not reach the email service. Please ensure the backend is running and updated.' };
    }

    const data = await res.json();

    if (!res.ok) {
      console.error('🔴 Backend forgot-password error:', data);
      return { error: data.error || 'Failed to send reset email. Please try again.' };
    }

    console.log('✅ Password reset email sent via backend');
    return {
      success: true,
      message: 'Check your email for the Sawaflix password reset link. It may take a minute to arrive.',
    };

  } catch (error) {
    console.error('🔴 Unexpected reset password error:', error);
    return { error: 'An unexpected connection error occurred. Please try again.' };
  }
}

// Direct password update for the update-password page
export async function updatePasswordDirectly(formData) {
  try {
    const code = formData.get('code');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return { error: 'Both password fields are required' };
    }

    if (newPassword !== confirmPassword) {
      return { error: 'Passwords do not match' };
    }

    if (newPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
    }

    const supabase = await createClient();

    // If we have a code, exchange it first
    if (code) {
      console.log('🟡 Exchanging code for session...');
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('🔴 Code exchange error:', exchangeError);

        // If exchange fails but we have a session, continue
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          return {
            error: 'This reset link is invalid or has expired. Please request a new one.'
          };
        }
      }
    }

    // Check if we have a valid session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'No active session. Please use a valid reset link.' };
    }

    // Update the password
    console.log('🟡 Updating password...');
    const { data, error: updateError } = await supabase.auth.updateUser({
      password: newPassword.toString(),
    });

    if (updateError) {
      console.error('🔴 Password update error:', updateError.message);
      return { error: updateError.message };
    }

    console.log('✅ Password updated successfully for user:', data.user?.email);

    // Sign out after password update
    await supabase.auth.signOut();

    return {
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
      redirectTo: '/login?message=password_updated_success'
    };

  } catch (error) {
    console.error('🔴 Unexpected password update error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// For logged-in users to change their password
export async function updatePasswordLoggedIn(formData) {
  try {
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: 'All password fields are required' };
    }

    if (newPassword !== confirmPassword) {
      return { error: 'New passwords do not match' };
    }

    if (newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters long' };
    }

    const supabase = await createClient();

    // First verify current password by trying to re-authenticate
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'You must be logged in to change your password.' };
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword.toString(),
    });

    if (error) {
      console.error('🔴 Update password error:', error.message);
      return { error: error.message };
    }

    console.log('✅ Password updated for logged-in user:', user.email);

    return {
      success: true,
      message: 'Password updated successfully!'
    };

  } catch (error) {
    console.error('🔴 Unexpected update password error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function handleSignOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('🔴 Sign out error:', error.message);
    return redirect('/login?error=signout_failed');
  }

  // Revalidate all paths
  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/login');

  console.log('✅ User signed out successfully');
  return redirect('/');
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('🔴 Get user error:', error.message);
      return { error: error.message };
    }

    return { user };

  } catch (error) {
    console.error('🔴 Unexpected get user error:', error);
    return { error: 'Failed to get user information' };
  }
}

export async function checkAuth() {
  try {
    const supabase = await createClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('🔴 Check auth error:', error.message);
      return { authenticated: false, error: error.message };
    }
    let role = 'client';
    if (session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      role = userData?.role || 'client';
    }

    return {
      authenticated: !!session,
      session,
      user: session?.user,
      role: role
    };

  } catch (error) {
    console.error('🔴 Unexpected check auth error:', error);
    return { authenticated: false, error: 'Auth check failed' };
  }
}

// Verify reset token
export async function verifyResetRequest(code) {
  try {
    if (!code) {
      return { error: 'No reset code provided' };
    }

    const supabase = await createClient();

    // Try to exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('🔴 Reset code verification error:', exchangeError.message);
      return {
        error: exchangeError.message.includes('expired')
          ? 'This reset link has expired. Please request a new one.'
          : 'This reset link is invalid.',
        code
      };
    }

    // Check if we have a valid session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Unable to verify reset request. Please try again.' };
    }

    return {
      success: true,
      session,
      message: 'Reset request verified successfully'
    };

  } catch (error) {
    console.error('🔴 Unexpected verification error:', error);
    return { error: 'An unexpected error occurred during verification.' };
  }
}

// Quick login test function
export async function testLogin(email, password) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: true,
      user: data.user
    };

  } catch (error) {
    console.error('🔴 Test login error:', error);
    return { error: error.message };
  }
}

// Validate session (useful for middleware or protected pages)
export async function validateSession() {
  try {
    const supabase = await createClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { valid: false, error: error.message };
    }

    return {
      valid: !!session,
      session,
      user: session?.user
    };

  } catch (error) {
    console.error('🔴 Session validation error:', error);
    return { valid: false, error: 'Session validation failed' };
  }
}

// Sync auth user to public.users table
export async function syncUserToPublic() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'No authenticated user found' };
    }

    console.log('🟡 Syncing user to public.users:', user.email);

    const platformRole = user.user_metadata?.category || user.user_metadata?.role || 'client';

    const { error: syncError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.full_name || user.user_metadata?.username || user.email,
        role: platformRole === 'creator' ? 'creator' : 'viewer',
        platform_role: platformRole === 'creator' ? 'artist' : 'client',
        created_at: new Date(user.created_at).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (syncError) {
      console.error('🔴 User sync error:', syncError.message);
      return { error: syncError.message };
    }

    console.log('✅ User synced successfully');
    return { success: true };

  } catch (error) {
    console.error('🔴 Sync user error:', error);
    return { error: error.message };
  }
}
