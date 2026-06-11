# START HERE 👋

Welcome to the SpaceX Member Portal MVP project. This document guides you through the complete setup and development workflow.

## What You Have

You have a **fully configured database layer** with TypeScript contracts ready for React UI development.

**Phase 1 (Complete):** Database schema, RLS security, TypeScript types, and query helpers  
**Phase 2 (Next):** React UI - login page, member portal, admin dashboard

## 5-Minute Quick Start

1. **Create Supabase account** → https://supabase.com (free tier ok)
2. **Copy credentials to .env.local**
   ```bash
   cp .env.example .env.local
   # Add your Supabase URL and anon key
   ```
3. **Run SQL in Supabase** → Open SQL Editor, run files in `sql/` folder in order
4. **Start dev server** → `pnpm dev`
5. **Ready to code** → Open `src/` and start building React components

## Full Setup (15 Minutes)

Follow **[SETUP.md](./SETUP.md)** for complete step-by-step instructions.

Key steps:
- Create Supabase project
- Get credentials
- Run 5 SQL files
- Create first admin user
- Set up .env.local
- Start dev server

## Learn the Codebase (10 Minutes)

### Quick Reference: **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)**
Type examples, query functions, common patterns.

### Project Structure
```
src/
├── types/member.ts      # TypeScript types (Member, MemberTier, etc.)
├── lib/
│   ├── supabase.ts      # Supabase client initialization
│   └── queries.ts       # Database query functions
├── components/          # (You'll build these in Phase 2)
└── App.tsx             # Root component
```

### Three Core Files

**1. Types: `src/types/member.ts`**
```typescript
// All TypeScript types used in the app
Member, MemberInsert, MemberUpdate
MemberTier, MemberStatus, MemberRole
isMemberTier(), isMemberStatus(), isMemberRole()
```

**2. Queries: `src/lib/queries.ts`**
```typescript
// All database operations
getCurrentMember(email)
listMembers()
createMember(input)
updateMember(id, input)
deleteMember(id)
searchMembers(query)
getMemberProfile(id)
getMemberCount()
getMembersByStatus(status)
```

**3. Client: `src/lib/supabase.ts`**
```typescript
// Supabase configuration
supabase              // Main client
getCurrentUser()      // Get auth user
getCurrentSession()   // Get session
signOut()            // Sign out
```

## Database Layer Ready

The database is **secure by default**:

- ✅ **Row Level Security (RLS)** enforced at database layer
- ✅ **Regular users** see only their own record
- ✅ **Admins** can read and modify all records
- ✅ **Type-safe** TypeScript types prevent invalid data
- ✅ **Auto-timestamps** updated_at updates automatically

## How to Use in Your Components

```typescript
import { getCurrentMember, listMembers } from '@/lib/queries';
import { Member, MemberTier, MemberStatus } from '@/types/member';

export function MyComponent() {
  const [member, setMember] = useState<Member | null>(null);
  
  useEffect(() => {
    // Fetch current user's profile
    getCurrentMember('user@example.com')
      .then(setMember)
      .catch(error => console.error('Failed to load:', error));
  }, []);

  if (!member) return <div>Loading...</div>;

  return (
    <div>
      <h1>{member.name}</h1>
      <p>Tier: {member.tier}</p>
      <p>Status: {member.status}</p>
    </div>
  );
}
```

## Documentation Map

| Document | Purpose | When to Use |
|----------|---------|------------|
| **[SETUP.md](./SETUP.md)** | Step-by-step setup | First time running project |
| **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** | Code examples & patterns | During development |
| **[DATABASE.md](./DATABASE.md)** | In-depth database docs | Understanding RLS & schema |
| **[README.md](./README.md)** | Project overview | Project context |
| **[PHASE1-SUMMARY.md](./PHASE1-SUMMARY.md)** | What was built | Understanding architecture |
| **[START-HERE.md](./START-HERE.md)** | This file | Getting oriented |

## Next: Build Phase 2 UI

Once database is set up, you're ready to build:

### Page 1: Login Page
- Email OTP sign-in with Supabase Auth
- Handle verification code
- Redirect to portal on success

### Page 2: Member Portal
- Display current user's profile
- Show tier, status, member_since
- Sign out button

### Page 3: Admin Dashboard (if user is admin)
- List all members (table)
- Search/filter by name, email, status
- Create new member (form)
- Edit member details
- Delete member (with confirmation)

## Development Workflow

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview build
pnpm preview

# Type checking
pnpm type-check

# Linting (if configured)
pnpm lint
```

## Verify Setup is Working

In browser DevTools console:
```javascript
// Should return member object
const member = await window.queries.getCurrentMember('your@email.com');
console.log(member);

// Should return array of members (if admin)
const members = await window.queries.listMembers();
console.log(members);
```

## Common Issues & Solutions

### "Missing Supabase environment variables"
- Check `.env.local` exists (not `.env`)
- Check variables start with `VITE_`
- Restart dev server

### "Permission denied" on database queries
- User needs a member record (admin creates it)
- Check user is authenticated
- Check RLS policies in Supabase dashboard

### "Connection refused" to database
- Check Supabase project is created
- Check URL is correct
- Wait 2-3 minutes if project was just created

See [DATABASE.md - Troubleshooting](./DATABASE.md#troubleshooting) for more.

## File Structure Overview

```
spacex-member-portal/
├── src/
│   ├── types/
│   │   └── member.ts             ← TypeScript types
│   ├── lib/
│   │   ├── supabase.ts           ← Supabase client
│   │   └── queries.ts            ← Database queries
│   ├── components/               ← Your React components (build these)
│   ├── pages/                    ← Your page routes (build these)
│   └── App.tsx                   ← Root component
├── sql/
│   ├── 01-create-members-table.sql
│   ├── 02-create-update-trigger.sql
│   ├── 03-create-rls-policies.sql
│   ├── 04-bootstrap-admin.sql
│   └── 05-seed-sample-members.sql
├── .env.example                  ← Copy to .env.local
├── .env.local                    ← Your local credentials (create this)
├── package.json                  ← Dependencies
├── tsconfig.json                 ← TypeScript config
├── START-HERE.md                 ← This file
├── SETUP.md                      ← Detailed setup
├── QUICK-REFERENCE.md            ← Code examples
├── DATABASE.md                   ← Database docs
├── README.md                     ← Project overview
└── PHASE1-SUMMARY.md             ← What was built
```

## Key Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend (PostgreSQL + Auth)
- **shadcn/ui** - Component library (ready to use)

## Getting Help

1. **Setup issues?** → Follow [SETUP.md](./SETUP.md)
2. **Code examples?** → Check [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
3. **Database questions?** → Read [DATABASE.md](./DATABASE.md)
4. **Architecture?** → See [PHASE1-SUMMARY.md](./PHASE1-SUMMARY.md)
5. **Console errors?** → Check the error message and look in relevant docs

## Ready? Let's Go! 🚀

```bash
# 1. Install dependencies
pnpm install

# 2. Set up database (follow SETUP.md)
# - Create Supabase account
# - Run SQL files
# - Create admin user

# 3. Create .env.local with credentials
cp .env.example .env.local
# Edit .env.local with your Supabase details

# 4. Start developing
pnpm dev

# 5. Open http://localhost:5173 in browser
# You're ready to build UI!
```

---

**Next:** Open [SETUP.md](./SETUP.md) for detailed setup instructions.

**Questions?** Check [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) or [DATABASE.md](./DATABASE.md).

Happy coding! 🎉
