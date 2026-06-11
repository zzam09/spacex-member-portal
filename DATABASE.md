# Database Setup Guide

This guide explains how to set up the Supabase PostgreSQL database for the SpaceX Member Portal MVP.

## Overview

The database consists of a single `members` table with:
- Unique constraints on email
- Check constraints on tier, status, and role enums
- Automatic timestamp management
- Row Level Security (RLS) for access control
- Helper functions for admin checking

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings → API
3. Set up environment variables (see [Environment Setup](#environment-setup))

## Setup Steps

### Step 1: Create the Members Table

Open Supabase SQL Editor and run:

```bash
# File: sql/01-create-members-table.sql
```

This creates:
- `members` table with 11 columns
- Indexes for email, role, status, and created_at
- Enables RLS on the table

**Schema:**
- `id` UUID - Primary key, auto-generated
- `email` TEXT - Unique, required (links to auth)
- `name` TEXT - Required
- `tier` TEXT - Enum: Explorer, Pioneer, Vanguard (default: Explorer)
- `status` TEXT - Enum: ACTIVE, PENDING, SUSPENDED (default: ACTIVE)
- `role` TEXT - Enum: member, admin (default: member)
- `title` TEXT - Optional job title
- `location` TEXT - Optional location
- `member_since` DATE - Optional membership start date
- `created_at` TIMESTAMPTZ - Auto-set to now()
- `updated_at` TIMESTAMPTZ - Auto-set to now(), updated on each change

### Step 2: Create Update Trigger

Run in Supabase SQL Editor:

```bash
# File: sql/02-create-update-trigger.sql
```

This creates a PostgreSQL trigger that automatically updates `updated_at` whenever a row is modified. Without this, the timestamp would only be set once at creation.

### Step 3: Enable RLS and Create Policies

Run in Supabase SQL Editor:

```bash
# File: sql/03-create-rls-policies.sql
```

This sets up:

#### RLS Helper Function: `is_admin()`

```sql
is_admin() -> BOOLEAN
```

Checks if the current authenticated user (identified by `auth.jwt() ->> 'email'`) has:
- A member record in the `members` table
- `role = 'admin'`
- `status = 'ACTIVE'`

Uses `SECURITY DEFINER` with fixed `search_path` to prevent recursive RLS issues.

#### RLS Policies

| Policy | Rule | Access |
|--------|------|--------|
| "Users can read own member record" | SELECT | Users see only their own email's row |
| "Admins can read all members" | SELECT | Admins see all rows via `is_admin()` |
| "Admins can insert members" | INSERT | Only admins can create members |
| "Admins can update members" | UPDATE | Only admins can modify members |
| "Admins can delete members" | DELETE | Only admins can remove members |

**How It Works:**
- When a user queries `SELECT * FROM members`, Supabase checks their auth token
- Regular users see only rows where `email = auth.jwt() ->> 'email'` (their own record)
- Admins (determined by `is_admin()`) see all rows
- Insert/Update/Delete operations check `is_admin()` before allowing changes
- Service role (backend only) bypasses all RLS policies

### Step 4: Bootstrap the First Admin

You need to manually create the first admin because the `is_admin()` function requires an existing admin in the database.

1. **Create an auth user** in Supabase:
   - Go to Authentication → Users
   - Click "Create new user"
   - Email: `admin@example.com` (or your email)
   - Password: Set a secure password
   - Confirm the email (check the test email or manually confirm)

2. **Insert the admin member record**:

   Run in Supabase SQL Editor:
   ```bash
   # File: sql/04-bootstrap-admin.sql
   ```

   Or manually insert:
   ```sql
   INSERT INTO members (email, name, role, tier, status, member_since)
   VALUES (
     'admin@example.com',
     'Admin User',
     'admin',
     'Vanguard',
     'ACTIVE',
     CURRENT_DATE
   );
   ```

3. **Verify:**
   ```sql
   SELECT id, email, name, role, status FROM members WHERE email = 'admin@example.com';
   ```

### Step 5: Seed Sample Data (Optional, Local Testing Only)

For development and testing, seed sample members:

Run in Supabase SQL Editor:

```bash
# File: sql/05-seed-sample-members.sql
```

This inserts 4 test members:
- 1 active admin (`admin@spacex.local`)
- 1 active member (`member@spacex.local`)
- 1 pending member (`pending@spacex.local`)
- 1 suspended member (`suspended@spacex.local`)

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

Get these from:
- Supabase Dashboard → Settings → API
- `Project URL` → `VITE_SUPABASE_URL`
- `anon [public]` key → `VITE_SUPABASE_ANON_KEY`

## Frontend Integration

### TypeScript Types

All member data is typed using `src/types/member.ts`:

```typescript
import { Member, MemberTier, MemberStatus, MemberRole } from '@/types/member';

const admin: Member = {
  id: '...',
  email: 'admin@example.com',
  name: 'Admin User',
  tier: MemberTier.VANGUARD,
  status: MemberStatus.ACTIVE,
  role: MemberRole.ADMIN,
  ...
};
```

### Query Contract

All database queries are defined in `src/lib/queries.ts`:

```typescript
import { getCurrentMember, listMembers, createMember, searchMembers } from '@/lib/queries';

// Get current user's member profile
const member = await getCurrentMember('user@example.com');

// List all members (admin only, RLS enforced)
const members = await listMembers();

// Create a new member (admin only, RLS enforced)
const newMember = await createMember({
  email: 'new@example.com',
  name: 'New User',
  tier: 'Pioneer',
  status: 'PENDING',
  role: 'member',
});

// Search members by name or email
const results = await searchMembers('alex');
```

### Supabase Client

Initialized in `src/lib/supabase.ts`:

```typescript
import { supabase, getCurrentUser, getCurrentSession } from '@/lib/supabase';

// Direct client access (advanced)
const { data, error } = await supabase
  .from('members')
  .select('*');

// Auth helpers
const user = await getCurrentUser();
const session = await getCurrentSession();
await signOut();
```

## RLS Security Explained

### Example: User Queries Their Own Record

1. User logs in with email `member@example.com`
2. React frontend calls: `getCurrentMember('member@example.com')`
3. Supabase receives query with auth token
4. RLS policy checks: `auth.jwt() ->> 'email' = 'member@example.com'` ✓
5. Query succeeds, user sees their own record

### Example: User Tries to Read Another Member

1. User logs in with email `member@example.com`
2. Frontend tries: `SELECT * FROM members WHERE email = 'other@example.com'`
3. Supabase applies RLS: `auth.jwt() ->> 'email' = 'other@example.com'` ✗
4. Query returns no rows (user doesn't have permission)
5. Frontend receives empty result (not an error)

### Example: Admin Lists All Members

1. Admin logs in with email `admin@example.com`
2. Frontend calls: `listMembers()`
3. Supabase checks RLS policy: `is_admin()` function runs
4. `is_admin()` checks:
   - Is there a member row with `email = 'admin@example.com'`? ✓
   - Is `role = 'admin'`? ✓
   - Is `status = 'ACTIVE'`? ✓
5. Policy passes, query succeeds
6. Admin sees all member rows

### Example: Non-Admin Tries to Create Member

1. User logs in with email `member@example.com` (not an admin)
2. Frontend tries: `createMember({ email: 'new@example.com', ... })`
3. Supabase checks INSERT policy: `is_admin()` returns false
4. Policy fails, query is rejected with error
5. Frontend receives error, member is not created

## Maintenance

### Updating a Member

```typescript
await updateMember(memberId, {
  status: 'SUSPENDED',
  updated_at: new Date().toISOString(),
  // Note: updated_at is auto-set by trigger, no need to manually set
});
```

The `updated_at` field is **automatically updated** by the PostgreSQL trigger on any UPDATE.

### Checking Admin Status

To verify if a user is an admin, use the helper function directly:

```sql
SELECT is_admin(); -- Returns true/false for current auth user
```

Or in the frontend, check the user's role:

```typescript
const member = await getCurrentMember(user.email);
const isAdmin = member?.role === 'admin' && member?.status === 'ACTIVE';
```

## Troubleshooting

### "Permission denied" errors on queries

**Cause:** RLS policies are too restrictive or user doesn't have permission.

**Solution:**
1. Verify user is authenticated: `await getCurrentUser()`
2. Check if user has a member record: `SELECT * FROM members WHERE email = 'your@email.com'`
3. Check if user is admin (if admin access needed): `SELECT is_admin()`
4. Review RLS policies in Supabase dashboard

### "No rows found" on first login

**Cause:** Authenticated user doesn't have a member record yet.

**Solution:**
1. Admin must create the member record first: `await createMember(...)`
2. Or use a signup flow that auto-creates the member row

### Timestamp not updating on UPDATE

**Cause:** Trigger didn't apply properly.

**Solution:**
1. Verify trigger exists: `SELECT * FROM pg_triggers WHERE tgname = 'update_members_updated_at'`
2. Re-run `sql/02-create-update-trigger.sql`
3. Trigger should fire automatically on next UPDATE

## Next Steps

Once the database is set up:

1. Implement Supabase Auth (email OTP) in React
2. Build login page with `auth.signInWithOtp()`
3. Create member portal to display user's profile
4. Build admin dashboard for member management
5. Add frontend error handling and loading states

See `src/lib/queries.ts` and `src/types/member.ts` for the complete frontend contract.
