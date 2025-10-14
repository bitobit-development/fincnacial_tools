/**
 * Create demo user for testing
 */
import { db } from '../src/lib/db/connection';
import { users } from '../src/lib/db/schema';

async function createDemoUser() {
  try {
    console.log('Creating demo user...');

    const result = await db.insert(users).values({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@example.com',
      name: 'Demo User',
      authProvider: 'demo',
      isActive: true,
    }).returning();

    console.log('Demo user created:', result[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      console.log('Demo user already exists');
    } else {
      console.error('Error creating demo user:', error);
    }
  }
  process.exit(0);
}

createDemoUser();
