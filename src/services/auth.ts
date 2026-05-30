import emailjs from '@emailjs/browser';
import { supabase } from '@/db/supabase';
import { emailJsConfig, adminConfig } from '@/lib/config';

export async function sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    console.log('Generating OTP for:', email);

    // Insert OTP into database
    const { error: dbError } = await supabase
      .from('otp_verification')
      .insert({
        email,
        otp,
        expires_at: expiresAt,
      });

    if (dbError) {
      console.error('Failed to store OTP:', dbError);
      return { success: false, error: 'Failed to generate OTP. Please try again.' };
    }

    console.log('OTP stored in database');

    // Get EmailJS configuration from admin settings
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('emailjs_public_key, emailjs_service_id, emailjs_template_id')
      .limit(1)
      .maybeSingle();

    // Use settings from database if available, otherwise fall back to env
    const publicKey = settings?.emailjs_public_key || emailJsConfig.publicKey;
    const serviceId = settings?.emailjs_service_id || emailJsConfig.serviceId;
    const templateId = settings?.emailjs_template_id || emailJsConfig.templateId;

    // Send email via EmailJS
    if (!publicKey || !serviceId || !templateId) {
      console.error('EmailJS not configured properly');
      
      // Delete the OTP since email can't be sent
      await supabase
        .from('otp_verification')
        .delete()
        .eq('email', email)
        .eq('otp', otp);
      
      return { success: false, error: 'Email service not configured. Please contact administrator to configure EmailJS settings.' };
    }

    try {
      emailjs.init(publicKey);
      
      const response = await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: email,
          email: email, // Add both formats for compatibility
          otp: otp,
          otp_code: otp, // Add alternative name
        }
      );

      console.log('Email sent successfully via EmailJS:', response.status);
      return { success: true };
    } catch (emailError: any) {
      console.error('EmailJS send failed:', emailError);
      
      // Delete the OTP since email failed
      await supabase
        .from('otp_verification')
        .delete()
        .eq('email', email)
        .eq('otp', otp);
      
      return { 
        success: false, 
        error: `Failed to send email: ${emailError.text || emailError.message || 'Unknown error'}. Please verify your EmailJS template has {{email}} or {{to_email}} variable and try again.` 
      };
    }
  } catch (error) {
    console.error('OTP generation error:', error);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
}

export async function verifyOTP(email: string, otp: string): Promise<{ valid: boolean; error?: string }> {
  try {
    console.log('Verifying OTP for:', email);

    // Use the secure verification function
    const { data, error } = await supabase.rpc('verify_otp_code', {
      check_email: email,
      check_otp: otp,
    });

    if (error) {
      console.error('OTP verification RPC error:', error);
      return { valid: false, error: `Verification error: ${error.message}` };
    }

    if (data === true) {
      console.log('OTP verified successfully');
      return { valid: true };
    }

    return { valid: false, error: 'Invalid or expired OTP' };
  } catch (error) {
    console.error('OTP verification error:', error);
    return { valid: false, error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function assignAdminRole(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (error) {
    console.error('Failed to assign admin role:', error);
  }
}

export function isAdminCredentials(email: string, password: string): boolean {
  const configEmail = adminConfig.email || 'admin@predator.com';
  const configPassword = adminConfig.password || '#Predator@2026!';
  
  const isMatch = email === configEmail && password === configPassword;
  
  console.log('Admin credential check:', {
    inputEmail: email,
    expectedEmail: configEmail,
    emailMatch: email === configEmail,
    passwordMatch: password === configPassword,
    overallMatch: isMatch
  });
  
  return isMatch;
}
