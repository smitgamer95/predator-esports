import { supabase } from '@/db/supabase';
import type { PaymentSettings } from '@/types/database';

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch payment settings:', error);
    return null;
  }

  return data;
}

export async function updatePaymentSettings(upiId: string, receiverName: string): Promise<{ error: Error | null }> {
  try {
    // Get existing settings
    const existing = await getPaymentSettings();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('payment_settings')
        .update({
          upi_id: upiId,
          receiver_name: receiverName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('payment_settings')
        .insert({
          upi_id: upiId,
          receiver_name: receiverName,
        });

      if (error) throw error;
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
