# Technical Debt and Known Issues

### Critical Technical Debt

1. **Component Size**: 6 components exceed 500 lines, with Profile.tsx at 1039 lines
2. **API Layer Scattered**: Duplicate `saveToDatabase` functions across components
3. **Type System Inconsistent**: ✅ **PARTIAL PROGRESS**: API layer now fully typed (Story 1.2), database/application type mismatches remain
4. **State Management**: Single DataContext doing too much, needs domain splitting
5. **Code Duplication**: Form patterns, validation logic, API calls repeated

### Workarounds and Gotchas

- **DataContext Caching**: 5-minute cache works well but creates coupling between unrelated data
- **Component Dependencies**: Large components have internal dependencies that make extraction difficult
- **API Error Handling**: Inconsistent patterns across different components
- **Type Guards Missing**: Runtime type validation not implemented
- **Form Validation**: Similar patterns duplicated across components instead of shared

### Performance Characteristics

**Current Performance** (Generally Good):
- 85% reduction in API calls through intelligent caching
- Real-time synchronization across components
- Instant navigation between cached components
- Memoized calculations in complex analytics

**Performance Concerns**:
- Large components cause unnecessary re-renders
- Single DataContext updates trigger too many components
- Form state management creates render cascades
