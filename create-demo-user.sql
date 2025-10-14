-- Create demo user
INSERT INTO users (id, email, name, auth_provider, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@example.com',
  'Demo User',
  'demo',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
