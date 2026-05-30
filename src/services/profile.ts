import { supabase } from '@/db/supabase';
import type { Profile } from '@/types/database';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return data;
}

export async function checkProfileComplete(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('name, phone, game_name, uid')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return false;

  return !!(data.name && data.phone && data.game_name && data.uid);
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}
