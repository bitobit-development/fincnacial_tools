-- Add demo user for testing and development
INSERT INTO "users" ("id", "email", "name", "auth_provider", "is_active", "created_at", "updated_at")
VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo User', 'demo', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- Also add another test user if needed
INSERT INTO "users" ("id", "email", "name", "auth_provider", "is_active", "created_at", "updated_at")
VALUES
  ('123e4567-e89b-12d3-a456-426614174000', 'test@example.com', 'Test User', 'demo', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;
