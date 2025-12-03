# Local Development with Supabase

This guide explains how to develop ChickenCare locally with a complete Supabase instance running on your machine.

## Prerequisites

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
2. **Supabase CLI** - Already installed via `supabase` devDependency

## Quick Start

### 1. Start Local Supabase
```powershell
npm run supabase:start
```

This starts:
- PostgreSQL database on `localhost:54322`
- Supabase API on `localhost:54321`
- Supabase Studio on `localhost:54323`
- Email testing (Inbucket) on `localhost:54324`

### 2. Switch to Local Environment
```powershell
# Copy local environment file
copy .env.supabase-local .env.local
```

### 3. Start Development Server
```powershell
netlify dev
```

### 4. Access Your Local App
- **App**: http://localhost:8888
- **Supabase Studio**: http://localhost:54323
- **Email Testing**: http://localhost:54324

## Environment Switching

### Local Development (isolated database)
```powershell
copy .env.supabase-local .env.local
npm run supabase:start
netlify dev
```

### Production Testing (real database)
```powershell
# Use your original .env.local with production Supabase URL
netlify dev
```

## Database Workflow

### Making Schema Changes

1. **Make changes in Supabase Studio** (localhost:54323)
   - Add tables, columns, RLS policies, etc.

2. **Generate a migration file**
   ```powershell
   npm run supabase:diff my_change_name
   ```
   This creates `supabase/migrations/[timestamp]_my_change_name.sql`

3. **Test the migration**
   ```powershell
   npm run supabase:reset
   ```
   This resets your local DB and replays all migrations + seed data

4. **Push to production** (when ready)
   ```powershell
   # Link to production project first
   npx supabase link --project-ref yckjarujczxrlaftfjbv
   
   # Push migrations
   npm run supabase:push
   ```

### Pulling Production Schema

If production has changes you need locally:
```powershell
npm run supabase:pull
```

## Test Data (Seed)

Edit `supabase/seed.sql` to add test data for local development.

The seed runs automatically when you:
- Start Supabase for the first time
- Run `npm run supabase:reset`

**Default test user:**
- Email: `dev@chickencare.local`
- Password: `testpassword123`

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run supabase:start` | Start local Supabase |
| `npm run supabase:stop` | Stop local Supabase |
| `npm run supabase:status` | Check status and URLs |
| `npm run supabase:reset` | Reset DB + run migrations + seed |
| `npm run supabase:diff NAME` | Generate migration from changes |
| `npm run supabase:push` | Push migrations to production |
| `npm run supabase:pull` | Pull production schema locally |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                                │
│                                                                      │
│  ┌──────────────────┐       ┌────────────────────────────────────┐  │
│  │   Your Browser   │       │        Docker Containers          │  │
│  │                  │       │                                    │  │
│  │  localhost:8888  │──────▶│  ┌────────────────────────────┐   │  │
│  │  (Netlify Dev)   │       │  │  Supabase API (:54321)     │   │  │
│  │                  │       │  └────────────────────────────┘   │  │
│  └──────────────────┘       │  ┌────────────────────────────┐   │  │
│                             │  │  PostgreSQL (:54322)       │   │  │
│  ┌──────────────────┐       │  │  - Your schema             │   │  │
│  │ Supabase Studio  │       │  │  - Test data               │   │  │
│  │ localhost:54323  │──────▶│  │  - RLS policies            │   │  │
│  └──────────────────┘       │  └────────────────────────────┘   │  │
│                             │  ┌────────────────────────────┐   │  │
│  ┌──────────────────┐       │  │  Inbucket (:54324)         │   │  │
│  │ Email Testing    │       │  │  - Catches all emails      │   │  │
│  │ localhost:54324  │──────▶│  │  - Auth confirmations      │   │  │
│  └──────────────────┘       │  └────────────────────────────┘   │  │
│                             └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Docker not running
```
Error: Cannot connect to Docker daemon
```
→ Start Docker Desktop

### Port already in use
```
Error: port 54321 already in use
```
→ Run `npm run supabase:stop` first, or check for other processes

### Migration conflicts
```
Error: migration has already been applied
```
→ Run `npm run supabase:reset` to start fresh

### Need production data locally
You can export data from production Supabase dashboard (Table Editor → Export CSV) and import to local, but be careful with sensitive user data.

## Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Always test migrations locally first** - Use `supabase:reset`
3. **Keep seed.sql updated** - Makes onboarding easy
4. **Use meaningful migration names** - `add_customer_notes` not `update1`
