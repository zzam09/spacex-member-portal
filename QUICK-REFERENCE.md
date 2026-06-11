# Quick Reference - Database & Frontend Contracts

Fast lookup for developers building UI on top of the database setup.

## 1. Setup (One Time)

```bash
# Install deps
pnpm install

# Create .env.local with Supabase credentials
cp .env.example .env.local
# Edit .env.local and add your Supabase URL and anon key

# Run SQL files in Supabase SQL Editor (in order)
# See SETUP.md for full instructions
sql/01-create-members-table.sql
sql/02-create-update-trigger.sql
sql/03-create-rls-policies.sql
sql/04-bootstrap-admin.sql
sql/05-seed-sample-members.sql (optional)

# Start dev server
pnpm dev
```

## 2. Type Reference

```typescript
import { 
  Member, 
  MemberInsert, 
  MemberUpdate,
  MemberProfile,
  MemberListItem,
  MemberTier, 
  MemberStatus, 
  MemberRole 
} from '@/types/member';

// Member object from database
const member: Member = {
  id: 'uuid',
  email: 'user@example.com',
  name: 'User Name',
  tier: MemberTier.PIONEER,           // 'Explorer' | 'Pioneer' | 'Vanguard'
  status: MemberStatus.ACTIVE,        // 'ACTIVE' | 'PENDING' | 'SUSPENDED'
  role: MemberRole.ADMIN,             // 'member' | 'admin'
  title: 'Engineer' | null,
  location: 'San Francisco' | null,
  member_since: '2024-06-11' | null,  // ISO date string
  created_at: '2024-06-11T10:00:00Z', // ISO timestamp
  updated_at: '2024-06-11T12:00:00Z'  // ISO timestamp
};

// For creating members (omits id, created_at, updated_at)
const newMember: MemberInsert = {
  email: 'new@example.com',
  name: 'New User',
  tier: MemberTier.EXPLORER,
  status: MemberStatus.PENDING,
  role: MemberRole.MEMBER,
  title: null,
  location: null,
  member_since: null,
};

// For updating members (all fields optional)
const update: Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>> = {
  status: MemberStatus.SUSPENDED,
  tier: MemberTier.VANGUARD,
};
```

## 3. Query Functions

```typescript
import {
  getCurrentMember,
  listMembers,
  createMember,
  updateMember,
  deleteMember,
  searchMembers,
  getMemberProfile,
  getMemberCount,
  getMembersByStatus
} from '@/lib/queries';

// Get current user's profile (anyone can call)
const user = await getCurrentMember('user@example.com');
// Returns: Member | null

// List all members (admin only)
const allMembers = await listMembers();
// Returns: MemberListItem[]
// RLS enforces: only admins see all; non-admins get empty array

// Create new member (admin only)
const created = await createMember({
  email: 'new@example.com',
  name: 'New User',
  tier: MemberTier.PIONEER,
  status: MemberStatus.ACTIVE,
  role: MemberRole.MEMBER,
});
// Returns: Member | throws error if not admin

// Update member (admin only)
const updated = await updateMember(memberId, {
  status: MemberStatus.SUSPENDED,
  title: 'New Title',
});
// Returns: Member | throws error if not admin

// Delete member (admin only)
await deleteMember(memberId);
// Returns: void | throws error if not admin

// Search members (admin only)
const results = await searchMembers('alex');
// Returns: MemberListItem[]
// Searches name and email with ILIKE (case-insensitive)

// Get member's public profile
const profile = await getMemberProfile(memberId);
// Returns: MemberProfile | null
// Anyone can call - returns limited public info

// Get member count (admin only)
const count = await getMemberCount();
// Returns: number

// Get members by status (admin only)
const active = await getMembersByStatus(MemberStatus.ACTIVE);
// Returns: MemberListItem[]
```

## 4. Supabase Client & Auth

```typescript
import { supabase, getCurrentUser, getCurrentSession, signOut } from '@/lib/supabase';

// Get current auth user
const user = await getCurrentUser();
// Returns: User | null

// Get current session
const session = await getCurrentSession();
// Returns: Session | null

// Sign out
await signOut();

// Direct client access (advanced)
const { data, error } = await supabase
  .from('members')
  .select('*');
```

## 5. Common Patterns

### Check if User is Admin

```typescript
async function isAdmin(email: string): Promise<boolean> {
  const member = await getCurrentMember(email);
  return member?.role === MemberRole.ADMIN && member?.status === MemberStatus.ACTIVE;
}
```

### Fetch and Display List

```typescript
async function loadMembersList() {
  try {
    const members = await listMembers();
    // members is typed as MemberListItem[]
    return members;
  } catch (error) {
    console.error('Failed to load members:', error);
    return [];
  }
}
```

### Create Member with Validation

```typescript
async function addMember(formData: Record<string, unknown>) {
  // Validate required fields
  if (!formData.email || !formData.name) {
    throw new Error('Email and name are required');
  }

  // Create member
  const member = await createMember({
    email: String(formData.email),
    name: String(formData.name),
    tier: (formData.tier as MemberTier) || MemberTier.EXPLORER,
    status: (formData.status as MemberStatus) || MemberStatus.PENDING,
    role: (formData.role as MemberRole) || MemberRole.MEMBER,
    title: formData.title ? String(formData.title) : null,
    location: formData.location ? String(formData.location) : null,
    member_since: formData.member_since ? String(formData.member_since) : null,
  });

  return member;
}
```

### Update with Partial Data

```typescript
async function updateMemberStatus(id: string, status: MemberStatus) {
  const updated = await updateMember(id, { status });
  // Other fields remain unchanged
  // updated_at is automatically set by trigger
  return updated;
}
```

### Search with Debounce (React Hook)

```typescript
import { useCallback, useState } from 'react';

export function useMemberSearch() {
  const [results, setResults] = useState<MemberListItem[]>([]);
  
  const search = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    try {
      const members = await searchMembers(query);
      setResults(members);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    }
  }, []);

  return { results, search };
}
```

## 6. Error Handling

```typescript
// All query functions include error handling
// Errors are logged with [queries] prefix

try {
  const members = await listMembers();
} catch (error) {
  console.error('Error:', error);
  // Handle gracefully:
  // - Permission denied: user not admin
  // - Network error: show retry
  // - Auth error: redirect to login
}

// RLS Errors Common Cases:
// "new row violates row-level security policy"
//   → User doesn't have permission (e.g., not admin)
// "Permission denied for schema public"
//   → Auth token is invalid/expired
// "Relation does not exist"
//   → Database not set up yet
```

## 7. Enum Values

```typescript
// MemberTier (3 options)
'Explorer'
'Pioneer'
'Vanguard'

// MemberStatus (3 options)
'ACTIVE'
'PENDING'
'SUSPENDED'

// MemberRole (2 options)
'member'
'admin'

// Type guards for validation
import { isMemberTier, isMemberStatus, isMemberRole } from '@/types/member';

if (isMemberTier(value)) {
  // value is MemberTier
}
```

## 8. Database Constraints

```sql
-- Email must be unique
email TEXT NOT NULL UNIQUE

-- Tier must be one of these
tier TEXT CHECK (tier IN ('Explorer', 'Pioneer', 'Vanguard'))

-- Status must be one of these
status TEXT CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED'))

-- Role must be one of these
role TEXT CHECK (role IN ('member', 'admin'))

-- Timestamps are auto-managed
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now() -- Auto-updated by trigger
```

## 9. RLS Policy Summary

| Action | Regular User | Admin |
|--------|--------------|-------|
| **Read own record** | ✓ | ✓ |
| **Read other records** | ✗ | ✓ |
| **Create member** | ✗ | ✓ |
| **Update member** | ✗ | ✓ |
| **Delete member** | ✗ | ✓ |

Admin determined by: `role = 'admin'` AND `status = 'ACTIVE'`

## 10. Environment Variables

```bash
# Required in .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-long-key-here

# Optional (for frontend bootstrap, not recommended)
VITE_ADMIN_EMAILS=admin@example.com
```

Get from Supabase Dashboard → Settings → API

## 11. File Locations

```
src/
├── types/
│   └── member.ts           # Types, enums, guards
├── lib/
│   ├── supabase.ts         # Client init + auth helpers
│   └── queries.ts          # Query functions
└── components/             # Your React components (build these)

sql/
├── 01-create-members-table.sql
├── 02-create-update-trigger.sql
├── 03-create-rls-policies.sql
├── 04-bootstrap-admin.sql
└── 05-seed-sample-members.sql

.env.local                 # Your local credentials
DATABASE.md               # Full database docs
SETUP.md                  # Setup instructions
README.md                 # Project overview
```

## 12. Common Development Tasks

### Test a Query in Console

```javascript
// In browser DevTools console
import { getCurrentMember } from '@/lib/queries';
await getCurrentMember('your@email.com');
```

### Verify Supabase Connection

```typescript
import { supabase } from '@/lib/supabase';

// Test connection
const { data, error } = await supabase
  .from('members')
  .select('count');

console.log('Connection:', error ? 'Failed' : 'OK');
```

### Check Current User

```typescript
import { getCurrentUser } from '@/lib/supabase';

const user = await getCurrentUser();
console.log('Logged in as:', user?.email);
```

### Inspect Member Record

```typescript
import { getCurrentMember } from '@/lib/queries';

const member = await getCurrentMember('user@example.com');
console.log('Member:', {
  id: member?.id,
  name: member?.name,
  tier: member?.tier,
  role: member?.role,
  status: member?.status,
});
```

---

**Full Docs:** See DATABASE.md, SETUP.md, README.md
**Next Phase:** Build login page, portal, admin dashboard
