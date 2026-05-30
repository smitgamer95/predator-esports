import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xqaqobndxyqmdvgspvsy.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYXFvYm5keHlxbWR2Z3NwdnN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY2ODI5MSwiZXhwIjoyMDkzMjQ0MjkxfQ.Z1EBJCZ-o2kz2LgTC9wfEXvlJLSLY6nAq8c_Ul1neBI';

const ADMIN_EMAIL = 'admin@predator.com';
const ADMIN_PASSWORD = '#Predator@2026!';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupAdminAndData() {
  console.log('Starting admin setup and data insertion...');

  try {
    console.log('\n1. Creating admin account...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('Admin account already exists, fetching user...');
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const adminUser = users.users.find(u => u.email === ADMIN_EMAIL);
        
        if (adminUser) {
          console.log('Updating admin role...');
          await supabaseAdmin
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', adminUser.id);
          console.log('✓ Admin role updated');
        }
      } else {
        throw authError;
      }
    } else if (authData.user) {
      console.log('✓ Admin account created');
      console.log('Setting admin role...');
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id);
      console.log('✓ Admin role assigned');
    }

    console.log('\n2. Inserting sample tournaments...');
    const { error: tournamentsError } = await supabaseAdmin
      .from('tournaments')
      .upsert([
        {
          name: 'Free Fire Championship - Solo',
          entry_fee: 50,
          mode: 'Solo',
          prize_1st: 1000,
          prize_2nd: 500,
          prize_3rd: 250,
          status: 'active',
        },
        {
          name: 'Free Fire Championship - Duo',
          entry_fee: 100,
          mode: 'Duo',
          prize_1st: 2000,
          prize_2nd: 1000,
          prize_3rd: 500,
          status: 'active',
        },
        {
          name: 'Free Fire Championship - Squad',
          entry_fee: 200,
          mode: 'Squad',
          prize_1st: 5000,
          prize_2nd: 2500,
          prize_3rd: 1000,
          status: 'active',
        },
      ], { onConflict: 'name' });

    if (tournamentsError) {
      console.error('Error inserting tournaments:', tournamentsError);
    } else {
      console.log('✓ Sample tournaments inserted');
    }

    console.log('\n3. Updating admin settings...');
    const { error: settingsError } = await supabaseAdmin
      .from('admin_settings')
      .update({
        upi_id: 'predator@upi',
        contact_email: 'admin@predator.com',
        contact_phone: '+91-1234567890',
      })
      .eq('id', (await supabaseAdmin.from('admin_settings').select('id').limit(1).single()).data?.id);

    if (settingsError) {
      console.error('Error updating settings:', settingsError);
    } else {
      console.log('✓ Admin settings updated');
    }

    console.log('\n✅ Setup completed successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Please save these credentials securely!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAdminAndData();
