import bcrypt from 'bcryptjs';
import { supabase } from '@/db/supabase';
import { adminConfig } from '@/lib/config';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Verify current admin password
 */
export async function verifyCurrentAdminPassword(userId: string, currentPassword: string): Promise<boolean> {
  // First check if it matches the config password (for initial setup)
  if (currentPassword === adminConfig.password) {
    return true;
  }

  // Then check against stored hash
  const { data: profile } = await supabase
    .from('profiles')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (profile?.password_hash) {
    return verifyPassword(currentPassword, profile.password_hash);
  }

  return false;
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify current password
    const isValid = await verifyCurrentAdminPassword(userId, currentPassword);
    if (!isValid) {
      return { success: false, error: 'Incorrect current password' };
    }

    // Validate new password
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update in database
    const { error } = await supabase
      .from('profiles')
      .update({ password_hash: passwordHash })
      .eq('id', userId);

    if (error) {
      console.error('Error updating password:', error);
      return { success: false, error: 'Failed to update password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'An error occurred while changing password' };
  }
}

/**
 * Verify admin login with password hash
 */
export async function verifyAdminLogin(email: string, password: string): Promise<boolean> {
  // Check config password first (for initial setup)
  if (email === adminConfig.email && password === adminConfig.password) {
    return true;
  }

  // Check against stored hash
  const { data: profile } = await supabase
    .from('profiles')
    .select('password_hash')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (profile?.password_hash) {
    return verifyPassword(password, profile.password_hash);
  }

  return false;
}
