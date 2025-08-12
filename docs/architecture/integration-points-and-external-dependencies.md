# Integration Points and External Dependencies

### External Services

| Service  | Purpose      | Integration Type | Key Files                              |
| -------- | ------------ | ---------------- | -------------------------------------- |
| Supabase | Database+Auth| SDK + REST       | `src/utils/supabase.ts`               |
| Vercel   | Hosting+API  | Functions        | `api/` folder, `vercel.json`          |
| GitHub   | Repository   | CI/CD            | Auto-deploy on push                    |

### Internal Integration Points

- **Frontend-Backend**: REST API through `/api` endpoints with JWT authentication
- **Data Flow**: DataContext → Components → API endpoints → Supabase
- **Authentication**: AuthContext → ProtectedRoute → Component access control
- **State Sync**: Optimistic updates with cache invalidation patterns
