-- Seed sample members for local testing
-- Run this AFTER 04-bootstrap-admin.sql

-- Admin member
INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'admin@spacex.local',
  'Mission Director',
  'admin',
  'Vanguard',
  'ACTIVE',
  'Admin',
  'Headquarters',
  CURRENT_DATE - INTERVAL '2 years'
)
ON CONFLICT (email) DO NOTHING;

-- Active member
INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member@spacex.local',
  'Alex Engineer',
  'member',
  'Pioneer',
  'ACTIVE',
  'Flight Systems Engineer',
  'Starbase, TX',
  CURRENT_DATE - INTERVAL '1 year'
)
ON CONFLICT (email) DO NOTHING;

-- Pending member
INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'pending@spacex.local',
  'Jordan Researcher',
  'member',
  'Explorer',
  'PENDING',
  'Research Assistant',
  'Los Angeles, CA',
  CURRENT_DATE
)
ON CONFLICT (email) DO NOTHING;

-- Suspended member
INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'suspended@spacex.local',
  'Casey Developer',
  'member',
  'Pioneer',
  'SUSPENDED',
  'Senior Software Engineer',
  'Seattle, WA',
  CURRENT_DATE - INTERVAL '6 months'
)
ON CONFLICT (email) DO NOTHING;

-- Verify seed data
SELECT email, name, role, tier, status FROM members ORDER BY created_at;
