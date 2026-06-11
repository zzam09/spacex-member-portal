# Setup Instructions

Complete guide to get the SpaceX Member Portal running locally.

## 1. Prerequisites

Install before starting:
- Node.js 18+ ([download](https://nodejs.org/))
- pnpm 10+ (`npm install -g pnpm`)
- A Supabase account (free at [supabase.com](https://supabase.com))

## 2. Clone & Install Dependencies

```bash
# Clone the repo (if not already done)
git clone <your-repo-url>
cd spacex-member-portal

# Install dependencies
pnpm install
```

## 3. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name:** spacex-member-portal (or your choice)
   - **Password:** Generate strong password, save it
   - **Region:** Choose closest to you
4. Click "Create new project" and wait ~2 min for setup

## 4. Get Supabase Credentials

1. Go to **Settings** (gear icon, top right)
2. Click **API** in left sidebar
3. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon [public]** key → `VITE_SUPABASE_ANON_KEY`

## 5. Create .env.local

```bash
# Copy the example
cp .env.example .env.local

# Edit .env.local and paste your credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-long-key-here
```

## 6. Set Up Database

Go to Supabase → **SQL Editor** (in left sidebar).

### Step A: Create Members Table

Copy & paste the contents of `sql/01-create-members-table.sql` into SQL Editor.

Click "Run" (green button, bottom right).

Expected output:
```
Query succeeded (1 result)
```

### Step B: Create Update Trigger

Copy & paste `sql/02-create-update-trigger.sql`.

Click "Run".

Expected output:
```
Query succeeded (2 results)
```

### Step C: Create RLS Policies

Copy & paste `sql/03-create-rls-policies.sql`.

Click "Run".

Expected output:
```
Query succeeded (7 results)
```

This includes:
- `is_admin()` function
- 5 RLS policies (read own, read all as admin, insert, update, delete)

### Step D: Bootstrap Admin

**Option 1: Create Auth User First (Recommended)**

1. Go to **Authentication** (left sidebar)
2. Click **Users**
3. Click **"Create new user"**
4. Email: `admin@example.com` (use your email)
5. Password: Choose strong password
6. Click "Create user"
7. Check email for confirmation link and confirm

Then copy & paste `sql/04-bootstrap-admin.sql` into SQL Editor.

Edit line 4 to match your admin email:
```sql
INSERT INTO members (email, name, role, tier, status, member_since)
VALUES (
  'YOUR-EMAIL-HERE',  -- ← Change this
  'Admin User',
  'admin',
  'Vanguard',
  'ACTIVE',
  CURRENT_DATE
)
```

Click "Run".

**Option 2: Direct Insert (Quick Start)**

If you want to test quickly without auth setup:

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

### Step E: Seed Sample Data (Optional)

To test with realistic sample members, run `sql/05-seed-sample-members.sql` in Supabase SQL Editor.

This creates 12+ test members:
- **2 Admins** (Vanguard tier, ACTIVE)
  - `admin1@example.com` - Sarah Mitchell
  - `admin2@example.com` - Marcus Chen
- **5 Active Members** (mix of tiers: 2 Vanguard, 3 Pioneer, 1 Explorer)
  - Elena Rodriguez, David Kumar, Jasmine Park, Thomas Wright, Priya Patel
  - Michael Torres, Nicole Anderson
- **2 Pending Members** (awaiting activation)
  - Jordan Lee, Alexandra Volkov
- **2 Suspended Members** (inactive accounts)
  - Christopher Blake, Rebecca Foster

**How to run:**

1. In Supabase, go to **SQL Editor**
2. Copy the entire contents of `sql/05-seed-sample-members.sql`
3. Paste into SQL Editor
4. Click "Run" (green button, bottom right)

**Expected output:**

The query runs 14 INSERT statements (idempotent with ON CONFLICT), then displays:
- A table of all seeded members
- Summary statistics grouped by role, tier, and status

This script is **safe to run multiple times** — it uses `ON CONFLICT (email) DO UPDATE` to avoid duplicates.

## 7. Verify Database Setup

In Supabase SQL Editor, run:

```sql
-- Should return 4-5 rows (including admin)
SELECT email, name, role, status FROM members;

-- Should return true for admin user
SELECT is_admin() AS is_current_user_admin;
```

## 8. Start Dev Server

```bash
pnpm dev
```

Output should show:
```
  VITE v5.x.x  build 0.00s

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

## 9. Test Frontend Setup

In a new terminal:

```bash
# Check that Supabase client is configured correctly
cd spacex-member-portal
node -e "
const env = require('dotenv').config({ path: '.env.local' }).parsed;
console.log('✓ VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('✓ VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
"
```

Output should show both as "✓ Set".

## 10. Test Database Connection

The frontend types and queries are ready to use:

```typescript
// In your components:
import { getCurrentMember } from '@/lib/queries';
import { Member } from '@/types/member';

// Test: Get current user's profile
const member = await getCurrentMember('admin@example.com');
console.log('Member:', member);
```

## Troubleshooting Setup

### Error: "Missing Supabase environment variables"

**Solution:**
1. Check `.env.local` exists (not `.env`)
2. Check variables start with `VITE_`
3. Restart dev server: `pnpm dev`

### Error: "Could not connect to database"

**Solution:**
1. Check Supabase project is created (go to [supabase.com](https://supabase.com))
2. Check URL is correct: Settings → API → Project URL
3. Wait 2-3 minutes if project was just created

### Error: "Permission denied" when running SQL

**Solution:**
1. In Supabase, click SQL Editor
2. Make sure you're authenticated (top right shows your email)
3. Check that RLS is enabled on `members` table

### Error: "RLS policy not found"

**Solution:**
1. Re-run `sql/03-create-rls-policies.sql`
2. Check it shows: "Query succeeded (7 results)"
3. Go to Table Editor → members → RLS Policies tab to verify

### Error: "Admin function not found"

**Solution:**
1. Re-run `sql/03-create-rls-policies.sql` (includes `is_admin()` function)
2. In SQL Editor, run: `SELECT is_admin();`
3. Should return `true` or `false`

## Next: Build UI

Once database is confirmed working, you can build:

1. **Login Page** - Supabase Auth email OTP sign-in
2. **Member Portal** - Display user's profile
3. **Admin Dashboard** - Member management CRUD

See [README.md](./README.md) for architecture and component guidelines.

## File Reference

| File | Purpose |
|------|---------|
| `sql/01-*.sql` | Create members table + indexes |
| `sql/02-*.sql` | Auto-update trigger for timestamps |
| `sql/03-*.sql` | RLS policies + is_admin() function |
| `sql/04-*.sql` | Bootstrap first admin |
| `sql/05-*.sql` | Sample data for testing |
| `src/types/member.ts` | TypeScript types |
| `src/lib/supabase.ts` | Supabase client init |
| `src/lib/queries.ts` | Database query helpers |
| `.env.example` | Environment template |
| `DATABASE.md` | Full database documentation |
| `README.md` | Project overview |
| `SETUP.md` | This file |

## Support

- **Supabase Issues:** [Supabase Docs](https://supabase.com/docs)
- **Database Issues:** Check [DATABASE.md](./DATABASE.md#troubleshooting)
- **Setup Issues:** Review steps above or check console for error messages

## Ready?

Once setup is complete:

```bash
# Make sure dev server is running
pnpm dev

# Open http://localhost:5173/ in browser
# You're ready to start building UI!
```

✅ **Database setup complete!**

Next: Build the UI (login page, portal, admin dashboard).
