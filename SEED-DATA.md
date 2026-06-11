# Seed Data Documentation

## Overview

The `sql/05-seed-sample-members.sql` file contains realistic sample data for testing the SpaceX Member Portal locally.

**13 sample members** with diverse:
- Tiers (Explorer, Pioneer, Vanguard)
- Statuses (ACTIVE, PENDING, SUSPENDED)
- Roles (admin, member)
- Titles and locations
- Join dates

## Member Breakdown

### Admins (2)
- `admin1@example.com` - Sarah Mitchell (Vanguard, ACTIVE, Platform Administrator)
- `admin2@example.com` - Marcus Chen (Vanguard, ACTIVE, Systems Administrator)

### Active Members (7)

**Vanguard Tier (2)**
- `member1@example.com` - Elena Rodriguez (Senior Flight Systems Engineer, Starbase, TX)
- `member2@example.com` - David Kumar (Propulsion Systems Lead, Boca Chica, TX)

**Pioneer Tier (3)**
- `member3@example.com` - Jasmine Park (Avionics Engineer, Los Angeles, CA)
- `member4@example.com` - Thomas Wright (Structural Analysis Engineer, Seattle, WA)
- `member5@example.com` - Priya Patel (Software Engineer, Ground Systems, Mountain View, CA)

**Explorer Tier (2)**
- `member6@example.com` - Michael Torres (Junior Test Engineer, Starbase, TX)
- `member7@example.com` - Nicole Anderson (Data Analyst Intern, Las Vegas, NV)

### Pending Members (2)
- `member8@example.com` - Jordan Lee (Pioneer, Network Engineer, Austin, TX)
- `member9@example.com` - Alexandra Volkov (Explorer, Research Scientist, Boston, MA)

### Suspended Members (2)
- `member10@example.com` - Christopher Blake (Vanguard, Manufacturing Engineer, McGregor, TX)
- `member11@example.com` - Rebecca Foster (Pioneer, Quality Assurance Lead, Brownsville, TX)

## How to Use

### Run the Seed Script

1. Open Supabase → **SQL Editor**
2. Copy the entire contents of `sql/05-seed-sample-members.sql`
3. Paste into the editor
4. Click **Run** (green button, bottom right)

### Expected Output

The script will:
1. Insert 13 members (idempotent, safe to re-run)
2. Display all seeded members
3. Show summary statistics by role, tier, and status

Example:
```
role   | tier      | status    | count
-------|-----------|-----------|-------
admin  | Vanguard  | ACTIVE    | 2
member | Vanguard  | ACTIVE    | 2
member | Vanguard  | SUSPENDED | 1
member | Pioneer   | ACTIVE    | 3
member | Pioneer   | PENDING   | 1
member | Pioneer   | SUSPENDED | 1
member | Explorer  | ACTIVE    | 2
member | Explorer  | PENDING   | 1
```

## Idempotent Design

The script uses **ON CONFLICT (email) DO UPDATE** to safely handle re-runs:

```sql
INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (...)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, ...
```

This means:
- Run it once to load initial data ✓
- Run it again without errors ✓
- Run it after schema changes to reload test data ✓

## Emails Used

All emails follow the pattern `memberN@example.com` where N is the member number.

**Important:** These are safe placeholder emails. They are:
- Not real email addresses
- Safe for testing
- Easy to identify as test data
- Follow RFC 5322 example domain convention

## Testing the Seed Data

After running the seed script, verify in Supabase SQL Editor:

```sql
-- List all members
SELECT email, name, role, tier, status FROM members ORDER BY created_at;

-- Count by role
SELECT role, COUNT(*) FROM members GROUP BY role;

-- Count by status
SELECT status, COUNT(*) FROM members GROUP BY status;

-- Check admin function works
SELECT is_admin() AS is_current_user_admin;
```

## Modifying Seed Data

To customize sample members:

1. Open `sql/05-seed-sample-members.sql`
2. Edit names, emails, titles, locations, or dates
3. Keep the structure (INSERT ... ON CONFLICT pattern)
4. Keep emails unique (email is PRIMARY KEY)
5. Run in Supabase SQL Editor to reload

Example edit:
```sql
INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'yourname@example.com',        -- Change email
  'Your Name',                   -- Change name
  'member',                      -- Change role (member or admin)
  'Pioneer',                     -- Change tier
  'ACTIVE',                      -- Change status
  'Your Title',                  -- Change title
  'Your Location',               -- Change location
  CURRENT_DATE - INTERVAL '6 months'  -- Change join date
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();
```

## Testing as Admin vs Member

### Test as Admin
Login with: `admin1@example.com` or `admin2@example.com`
- Can view all members (listMembers)
- Can create, update, delete members
- Can search members
- Can see member count and filter by status

### Test as Regular Member
Login with: `member1@example.com` or similar
- Can only view own profile (getCurrentMember)
- Cannot list other members
- Cannot create, update, or delete members

## Cleanup

To **delete all seed data** and start fresh:

```sql
DELETE FROM members WHERE email LIKE '%@example.com';
```

Then reload by running `sql/05-seed-sample-members.sql` again.

## Related Files

- `sql/04-bootstrap-admin.sql` - Create the first admin (run before this)
- `sql/03-create-rls-policies.sql` - RLS policies that govern access
- `src/lib/queries.ts` - Frontend functions to query this data
- `SETUP.md` - Full setup instructions
- `DATABASE.md` - Complete database documentation
