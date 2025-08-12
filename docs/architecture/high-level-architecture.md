# High Level Architecture

### Technical Summary

**Current State**: Working React application with organic growth patterns, successful user adoption, but significant technical debt requiring systematic refactoring before implementing intelligent features roadmap.

### Actual Tech Stack (from package.json)

| Category     | Technology               | Version | Notes                                    |
| ------------ | ------------------------ | ------- | ---------------------------------------- |
| Runtime      | Node.js                  | 18+     | Required for Vercel functions            |
| Frontend     | React                    | 19.0.0  | Latest version with new features         |
| Build Tool   | Vite                     | 6.3.1   | Fast development and builds              |
| TypeScript   | TypeScript               | 5.7.2   | ✅ API layer fully typed, components partial |
| Styling      | Tailwind CSS             | 4.1.4   | Primary styling system                   |
| Animation    | Framer Motion            | 12.7.4  | Complex animations throughout            |
| Database     | Supabase                 | 2.49.10 | PostgreSQL with RLS, authentication     |
| Routing      | React Router DOM         | 7.5.1   | Client-side routing                      |
| Charts       | Recharts                 | 2.15.3  | Dashboard visualizations                 |
| Deployment   | Vercel                   | -       | Functions + static hosting               |
| State Mgmt   | React Context            | -       | Custom caching with 5-minute expiry     |
| API Layer    | ✅ Unified Services      | 1.0     | NEW: Centralized API service layer      |

### Repository Structure Reality Check

- **Type**: Monorepo (frontend + API functions)
- **Package Manager**: npm (lock file present)
- **Notable**: API functions in root `/api` folder (Vercel pattern), extensive component library in single folder
