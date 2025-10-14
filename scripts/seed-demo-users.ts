/**
 * Seed script to add demo users to the database
 * Run with: npx tsx scripts/seed-demo-users.ts
 *
 * Requires POSTGRES_URL environment variable
 */

import { sql } from '@vercel/postgres';

async function seedDemoUsers() {
  console.log('🌱 Seeding demo users...\n');

  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable not found!');
    console.error('   Set it in your environment or .env.local file.');
    process.exit(1);
  }

  try {
    // Insert demo users with specific UUIDs
    const result = await sql`
      INSERT INTO users (id, email, name, auth_provider, is_active, created_at, updated_at)
      VALUES
        ('00000000-0000-0000-0000-000000000001'::uuid, 'demo@example.com', 'Demo User', 'demo', true, NOW(), NOW()),
        ('123e4567-e89b-12d3-a456-426614174000'::uuid, 'test@example.com', 'Test User', 'demo', true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
      RETURNING id, email, name
    `;

    console.log('✅ Demo users seeded successfully!\n');
    result.rows.forEach((user: any) => {
      console.log(`   📧 ${user.email}`);
      console.log(`      ID: ${user.id}`);
      console.log(`      Name: ${user.name}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo users:');
    console.error(error);
    process.exit(1);
  }
}

seedDemoUsers();
