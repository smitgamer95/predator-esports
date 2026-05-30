import { supabase } from '@/db/supabase';
import type { Tournament, TournamentRegistration, AdminSettings } from '@/types/database';

export async function getTournaments(status?: string) {
  let query = supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch tournaments:', error);
    return [];
  }

  return data || [];
}

export async function getTournamentById(id: string): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch tournament:', error);
    return null;
  }

  return data;
}

export async function getUserRegistration(tournamentId: string, userId: string): Promise<TournamentRegistration | null> {
  const { data, error } = await supabase
    .from('tournament_registrations')
    .select('*')
    .eq('user_id', userId)
    .eq('tournament_id', tournamentId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch registration:', error);
    return null;
  }

  return data;
}

export async function getTournamentRegistrations(tournamentId: string): Promise<TournamentRegistration[]> {
  const { data, error } = await supabase
    .from('tournament_registrations')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('status', 'approved')
    .order('slot_number', { ascending: true });

  if (error) {
    console.error('Failed to fetch tournament registrations:', error);
    return [];
  }

  return data || [];
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch admin settings:', error);
    return null;
  }

  return data;
}

export async function uploadPaymentScreenshot(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

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

export async function createRegistration(
  tournamentId: string,
  userId: string,
  paymentScreenshotUrl: string,
  username: string,
  phone: string,
  gamerId: string,
  inGameName: string
): Promise<{ error: Error | null }> {
  try {
    // Get all existing registrations for this tournament to find next available slot
    const { data: existingRegs, error: fetchError } = await supabase
      .from('tournament_registrations')
      .select('slot_number')
      .eq('tournament_id', tournamentId)
      .order('slot_number', { ascending: true });

    if (fetchError) throw fetchError;

    // Find first available slot number
    let slotNumber = 1;
    const usedSlots = (existingRegs || []).map(r => r.slot_number).filter(Boolean);
    while (usedSlots.includes(slotNumber)) {
      slotNumber++;
    }

    const { error } = await supabase
      .from('tournament_registrations')
      .insert({
        user_id: userId,
        tournament_id: tournamentId,
        username: username,
        phone: phone,
        gamer_id: gamerId,
        in_game_name: inGameName,
        slot_number: slotNumber,
        payment_screenshot_url: paymentScreenshotUrl,
        status: 'pending',
        eliminated: false,
      });

    if (error) throw error;

    // Update tournament filled_slots count
    await supabase.rpc('increment_filled_slots', { tournament_id: tournamentId });

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
