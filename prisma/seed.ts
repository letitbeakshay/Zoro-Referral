// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Settings
  console.log('Seeding settings...');
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      gymName: 'Zoro Gym',
      phone: '+919999999999',
      email: 'contact@zorogym.com',
      address: '123 Gym Street, Fitness City',
      socialLinks: { instagram: '', facebook: '' },
      standeeHeadline: 'Bring a Friend.',
      standeeOffer: 'Both of You Save ₹500.',
      standeeDiscountAmount: 500.00,
      standeeTerms: 'Valid on quarterly and annual memberships.',
      standeeWhatsappNumber: '+919999999999',
      primaryColor: '#1F6B45',
      couponPrefix: 'ZR',
      couponNumberLength: 4,
      couponAutoGeneration: true,
      couponExpiryDays: 30,
      couponMaxReferrals: 10,
      couponRewardAmount: 500.00,
      couponDiscountAmount: 500.00,
      couponMinPlan: 'quarterly',
      referralTerms: 'T&C Apply. Reward eligible after 3 paid months.',
      privacyPolicy: 'Your data is safe with us.',
    },
  });
  console.log('✅ Settings seeded:', settings.gymName);

  // 2. Seed Test Member
  console.log('Seeding initial active member...');
  const testMember = await prisma.member.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      id: '8c4749f7-7b89-4b68-b7a4-84ad1f4a9557',
      name: 'Akshay Kumar',
      phone: '9999999999',
      email: 'akshay@gmail.com',
      membershipId: 'MEM1001',
      referralCode: 'ZR1001',
      membershipStatus: 'active',
    },
  });
  console.log('✅ Initial member seeded:', testMember.name, `(${testMember.referralCode})`);

  // 3. Create Admin in Supabase Auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey && supabaseUrl !== 'https://[your-supabase-project].supabase.co') {
    console.log('Attempting to create admin user in Supabase Auth...');
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const adminEmail = 'admin@zorogym.com';
      const adminPassword = 'ZoroAdmin2026!';

      // Try creating the admin user
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: 'admin', name: 'Zoro Admin' },
      });

      if (error) {
        if (error.message.includes('already exists') || error.status === 422) {
          console.log(`ℹ️ Admin user (${adminEmail}) already exists in Supabase Auth.`);
        } else {
          console.error('❌ Error creating admin user:', error.message);
        }
      } else if (data.user) {
        console.log(`✅ Admin user successfully created in Supabase Auth: ${adminEmail} / ${adminPassword}`);
      }
    } catch (err: any) {
      console.error('⚠️ Could not connect to Supabase Auth API:', err.message || err);
    }
  } else {
    console.log('ℹ️ Skipping Supabase Auth admin creation (keys are not configured in .env).');
  }

  console.log('🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
