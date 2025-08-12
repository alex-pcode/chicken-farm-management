# Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/main.tsx` (React 19 + Vite setup)
- **App Router**: `src/App.tsx` (458 lines - contains Dashboard + routing)
- **Context Layer**: `src/contexts/DataContext.tsx`, `src/contexts/AuthContext.tsx`
- **API Layer**: `src/utils/authApiUtils.ts` (scattered patterns), `api/` folder (Vercel functions)
- **Types**: `src/types/index.ts`, `src/types/crm.ts`
- **Largest Components**: `src/components/Profile.tsx` (1039 lines), `src/components/FlockBatchManager.tsx` (886 lines)

### Enhancement Impact Areas

Based on the structural refactoring PRD, these areas will be heavily affected:

**Epic 1 (API Consolidation)**:
- `src/utils/authApiUtils.ts` - scattered API utilities need consolidation
- `src/contexts/DataContext.tsx` - caching layer patterns
- All components with duplicate `saveToDatabase` functions

**Epic 2 (Component Size Reduction)**:
- `src/components/Profile.tsx` (1039 lines) - PRIMARY TARGET
- `src/components/FlockBatchManager.tsx` (886 lines)
- `src/components/FeedCostCalculator.tsx` (652 lines)
- `src/components/ChickenViability.tsx` (618 lines)
- `src/components/FeedTracker.tsx` (612 lines)
- `src/components/EggCounter.tsx` (562 lines)
