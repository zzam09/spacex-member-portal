# API Layer Quick Start

## What You Have

A complete, production-ready API layer for your React + Vite Supabase portal:
- 7 query/mutation functions
- Full validation with Zod
- Error handling
- 21 passing tests
- 500+ lines of documentation

## Import & Use

```typescript
import {
  getCurrentMember,
  listMembers,
  searchMembers,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats
} from '@/lib/api/members';

import { isSuccess, isFailure } from '@/lib/api/response';
```

## Response Pattern

All functions return `Promise<ApiResponse<T>>`:

```typescript
const result = await getCurrentMember('user@example.com');

if (result.ok) {
  // Success: result is ApiSuccess<T>
  console.log(result.data);
} else {
  // Failure: result is ApiFailure
  console.error(result.error.code, result.error.message);
}
```

Or use type guards:

```typescript
const result = await searchMembers({});

if (isSuccess(result)) {
  console.log('Found', result.data.total, 'members');
} else if (isFailure(result)) {
  console.error('Error:', result.error.message);
}
```

## Common Tasks

### Get Current User Profile

```typescript
const result = await getCurrentMember('user@example.com');
if (result.ok) {
  const profile = result.data;
  console.log(`${profile.name} (${profile.tier})`);
}
```

### List All Members (Admin)

```typescript
const result = await listMembers();
if (result.ok) {
  result.data.forEach(member => {
    console.log(member.email, member.status);
  });
}
```

### Search Members (Admin)

```typescript
const result = await searchMembers({
  query: 'elena',
  tier: 'Vanguard',
  status: 'ACTIVE',
  limit: 25,
  offset: 0
});

if (result.ok) {
  console.log(`Total: ${result.data.total}`);
  console.log(`Showing: ${result.data.data.length}`);
}
```

### Create Member (Admin)

```typescript
const result = await createMember({
  email: 'newuser@example.com',
  name: 'Jane Doe',
  tier: 'Pioneer',
  status: 'ACTIVE',
  role: 'member',
  title: 'Engineer',
  location: 'Austin, TX',
  member_since: '2024-01-15'
});

if (result.ok) {
  console.log('Created:', result.data.id);
} else {
  console.error('Error:', result.error.message);
}
```

### Update Member (Admin)

```typescript
const result = await updateMember(memberId, {
  tier: 'Vanguard',
  status: 'ACTIVE'
});

if (result.ok) {
  console.log('Updated member');
}
```

### Delete Member (Admin)

```typescript
const result = await deleteMember(memberId);

if (result.ok) {
  console.log('Deleted:', result.data.id);
}
```

### Get Stats (Admin)

```typescript
const result = await getMemberStats();

if (result.ok) {
  const stats = result.data;
  console.log('Total:', stats.totalMembers);
  console.log('Active:', stats.activeMembers);
  console.log('Admins:', stats.adminCount);
  console.log('Tiers:', stats.tierBreakdown);
}
```

## Error Handling

Error codes:
- `UNAUTHENTICATED` (401) - User not logged in
- `FORBIDDEN` (403) - No permission
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (400) - Invalid input
- `DATABASE_ERROR` (500) - DB operation failed
- `UNKNOWN_ERROR` (500) - Other error

Example:

```typescript
const result = await updateMember(id, updates);

if (!result.ok) {
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      console.log('Invalid input:', result.error.message);
      break;
    case 'FORBIDDEN':
      console.log('You do not have permission');
      break;
    case 'NOT_FOUND':
      console.log('Member not found');
      break;
    default:
      console.log('Error:', result.error.message);
  }
}
```

## React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { searchMembers, isSuccess } from '@/lib/api/members';

export function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const result = await searchMembers({ limit: 50 });
      if (isSuccess(result)) {
        setMembers(result.data.data);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {members.map(m => (
        <li key={m.id}>{m.name} - {m.tier}</li>
      ))}
    </ul>
  );
}
```

## Validation

Input is validated automatically using Zod. Invalid inputs return:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email: Invalid email format; name: Name is required"
  }
}
```

**Create Member validation:**
- `email` - required, must be valid email format, must be unique
- `name` - required, 1-255 chars
- `tier` - Explorer (default), Pioneer, or Vanguard
- `status` - ACTIVE, PENDING (default), or SUSPENDED
- `role` - member (default) or admin
- `title`, `location` - optional strings
- `member_since` - optional, YYYY-MM-DD format

## Tests

All APIs are tested:

```bash
# Run tests
pnpm test:run

# Watch mode
pnpm test

# Visual UI
pnpm test:ui
```

Result: 21 tests, all passing ✓

## Documentation

- **docs/API.md** - Complete reference (500+ lines)
- **API-LAYER-SUMMARY.md** - Overview
- **src/tests/api.test.ts** - Test examples

## Type Definitions

```typescript
// Enums
enum MemberTier { EXPLORER, PIONEER, VANGUARD }
enum MemberStatus { ACTIVE, PENDING, SUSPENDED }
enum MemberRole { MEMBER, ADMIN }

// Interfaces
interface Member {
  id: string;
  email: string;
  name: string;
  tier: MemberTier | string;
  status: MemberStatus | string;
  role: MemberRole | string;
  title: string | null;
  location: string | null;
  member_since: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  suspendedMembers: number;
  adminCount: number;
  tierBreakdown: { explorer: number; pioneer: number; vanguard: number };
}
```

## Next Steps

You're ready to build the React UI! The API layer handles:
- ✅ Validation
- ✅ Error handling
- ✅ Type safety
- ✅ Supabase integration
- ✅ RLS enforcement (at database)

Build components that use these functions and let the database RLS policies enforce admin-only access.

---

**Questions?** See docs/API.md for complete reference.
