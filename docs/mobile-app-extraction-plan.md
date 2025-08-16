# Mobile Egg Tracker - Extraction Plan

## Overview

This document outlines the strategy for creating a standalone mobile egg tracking app from the current web application. The approach uses **Option 1: Separate Repository** to maintain complete isolation while maximizing code reuse.

## Development Strategy

### Phase 1: Current Web Development
Continue developing and refining the egg tracking features in the current web application until they are feature-complete and stable.

### Phase 2: Mobile Extraction (Future)
When ready, extract the egg tracking functionality into a standalone React Native mobile app with offline-first architecture.

## Architecture Comparison

### Current Web App Architecture
```
📱 Web App (D:\Koke\Aplikacija\)
├── 🔐 Authentication: Supabase Auth (user accounts)
├── 🗄️ Data Storage: Supabase PostgreSQL (cloud)
├── 🔄 Data Sync: Real-time with RLS policies
├── 💰 Cost Model: Scales with usage (potential cost concerns)
├── 🌐 Network: Requires internet connection
└── 🎯 Audience: Individual users with web access
```

### Future Mobile App Architecture
```
📱 Mobile App (D:\Koke\EggTrackerMobile\)
├── 🔐 Authentication: None (local device only)
├── 🗄️ Data Storage: SQLite (local device)
├── 🔄 Data Sync: Optional user-controlled backup/export
├── 💰 Cost Model: Zero infrastructure costs
├── 🌐 Network: Fully offline-capable
└── 🎯 Audience: Free app for mass distribution
```

## Code Extraction Map

### ✅ Direct Reuse (Copy As-Is)
These components contain pure business logic with minimal dependencies:

#### Types & Interfaces
- **File**: `src/types/index.ts`
- **Extract**: `EggEntry` interface
- **Usage**: Core data structure for egg entries
```typescript
export interface EggEntry {
  id: string;
  date: string;
  count: number;
  created_at?: string;
}
```

#### Validation Logic
- **File**: `src/utils/validation.ts`
- **Extract**: `validateEggCount` function
- **Usage**: Input validation for egg counts
```typescript
export const validateEggCount = (value: string | number): string | null => {
  // Business logic for validating egg counts (0-100, integers only)
}
```

#### Statistics Calculations
- **File**: `src/hooks/data/useEggData.ts`
- **Extract**: Statistics calculation logic (lines 118-148)
- **Usage**: Calculate totals, averages, weekly/monthly summaries
```typescript
const statistics = useMemo(() => {
  const totalEggs = validEntries.reduce((sum, entry) => sum + (entry?.count || 0), 0);
  const averageDaily = uniqueDates.length > 0 ? totalEggs / uniqueDates.length : 0;
  // ... weekly and monthly calculations
}, [entries]);
```

### 🔄 Adaptation Required (Modify for Mobile)
These components need architectural changes for mobile/offline use:

#### Data Management Hook
- **Current**: `src/hooks/data/useEggData.ts`
- **Adaptation**: Replace Supabase calls with SQLite operations
- **Key Changes**:
  - `apiService.production.getEggEntries()` → SQLite SELECT
  - `apiService.production.saveEggEntries()` → SQLite INSERT/UPDATE
  - Remove network error handling, add SQLite error handling

#### Form Components
- **Current**: `src/components/EggCounter.tsx`
- **Adaptation**: Convert to React Native components
- **Key Changes**:
  - Replace HTML form elements with React Native components
  - Adapt styling from Tailwind CSS to React Native StyleSheet
  - Replace date input with React Native DatePicker

#### UI Components
- **Current**: Form inputs, buttons, cards
- **Adaptation**: Rewrite using React Native UI library
- **Recommended Library**: React Native Elements or NativeBase

### ❌ Mobile-Specific Rewrites
These features need complete reimplementation for mobile:

#### Data Persistence Layer
- **Current**: Supabase client with real-time subscriptions
- **Mobile**: SQLite database with expo-sqlite
- **New Files**: 
  - `src/services/database.ts` - SQLite operations
  - `src/services/migration.ts` - Database schema management

#### Authentication
- **Current**: Supabase Auth with user sessions
- **Mobile**: No authentication (single-user local app)
- **Impact**: Remove all auth-related code

#### Offline Support
- **Current**: None (requires internet)
- **Mobile**: Complete offline functionality
- **New Features**:
  - Local data storage
  - Export/import functionality
  - Background sync (optional)

## Future Mobile Project Structure

When ready to extract, create this structure:

```
📁 D:\Koke\EggTrackerMobile\
├── 📱 app.json                 # Expo configuration
├── 📦 package.json             # Dependencies
├── 🎯 App.tsx                  # Root component
├── 📂 src/
│   ├── 📂 components/          # React Native UI components
│   │   ├── EggEntryForm.tsx    # Adapted from current EggCounter
│   │   ├── StatCard.tsx        # Adapted from current StatCard
│   │   ├── CalendarView.tsx    # New mobile-optimized calendar
│   │   └── ExportModal.tsx     # Data export functionality
│   ├── 📂 hooks/               # Custom hooks (adapted)
│   │   ├── useEggData.ts       # SQLite version of current hook
│   │   ├── useValidation.ts    # Adapted validation logic
│   │   └── useExport.ts        # Data export functionality
│   ├── 📂 services/            # Data & business logic
│   │   ├── database.ts         # SQLite operations
│   │   ├── storage.ts          # AsyncStorage for settings
│   │   └── export.ts           # CSV/JSON export logic
│   ├── 📂 types/               # TypeScript definitions
│   │   └── index.ts            # Copied from current types
│   ├── 📂 utils/               # Utility functions
│   │   ├── validation.ts       # Copied from current utils
│   │   ├── statistics.ts       # Extracted calculation logic
│   │   └── date.ts             # Date formatting utilities
│   └── 📂 screens/             # Screen components
│       ├── HomeScreen.tsx      # Main egg entry screen
│       ├── HistoryScreen.tsx   # Egg entry history
│       ├── StatsScreen.tsx     # Statistics dashboard
│       └── SettingsScreen.tsx  # App settings
└── 📂 assets/                  # Images, icons, fonts
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

## Extraction Timeline

### Preparation Phase (Before Extraction)
1. **Stabilize Web Features**: Ensure egg tracking is feature-complete
2. **Document Current State**: Update this plan with any architectural changes
3. **Identify Dependencies**: Note any new dependencies added to egg tracking
4. **Test Thoroughly**: Ensure all edge cases are handled

### Extraction Phase (1-2 weeks)
1. **Project Setup** (1-2 days)
   - Create new Expo project
   - Set up development environment
   - Configure basic navigation

2. **Core Logic Migration** (2-3 days)
   - Copy and adapt types/interfaces
   - Implement SQLite database layer
   - Port validation logic

3. **UI Implementation** (3-4 days)
   - Create React Native components
   - Implement main screens
   - Add navigation between screens

4. **Mobile Features** (2-3 days)
   - Add offline functionality
   - Implement data export
   - Set up notifications

5. **Testing & Polish** (2-3 days)
   - Test on multiple devices
   - Performance optimization
   - App store preparation

## Key Design Decisions

### Data Architecture
- **Local-First**: All data stored in SQLite on device
- **No Authentication**: Single-user app, no accounts needed
- **Export-Focused**: Users own their data, can export anytime
- **Zero Backend Costs**: No servers, no ongoing infrastructure

### Technology Stack
- **Framework**: React Native with Expo
- **Database**: SQLite (expo-sqlite)
- **Storage**: AsyncStorage for settings
- **UI Library**: React Native Elements or NativeBase
- **Navigation**: React Navigation
- **Notifications**: Expo Notifications

### Monetization Strategy
- **Core App**: Completely free
- **Optional Premium**: $1.99 one-time purchase for advanced features
  - Multiple flock management
  - Advanced analytics
  - Custom export formats
  - Cloud backup integration

## Success Metrics

### Technical Goals
- ✅ 100% offline functionality
- ✅ < 3 second app startup time
- ✅ < 50MB app size
- ✅ Works on iOS 13+ and Android 8+
- ✅ 99.9% crash-free sessions

### User Experience Goals
- ✅ < 10 seconds to log daily eggs
- ✅ Intuitive navigation (no training needed)
- ✅ Reliable data persistence
- ✅ Easy data export process

### Business Goals
- ✅ Zero ongoing operational costs
- ✅ Sustainable free app model
- ✅ Positive app store ratings (4.0+)
- ✅ Organic growth through word-of-mouth

## Risk Mitigation

### Technical Risks
- **SQLite Migration Issues**: Test thoroughly with large datasets
- **Performance on Older Devices**: Set minimum device requirements
- **Data Loss**: Implement automatic backups and export reminders

### Business Risks
- **App Store Rejection**: Follow guidelines strictly, prepare for review
- **User Adoption**: Ensure core functionality is superior to web version
- **Maintenance Burden**: Keep codebase simple and well-documented

## Future Considerations

### Potential Enhancements
- **Multi-Platform**: Consider desktop app using Electron
- **Advanced Analytics**: Trend analysis and forecasting
- **Community Features**: Anonymous usage statistics sharing
- **Integration**: Connect with popular farm management tools

### Exit Strategies
- **Open Source**: Release as open-source project if maintenance becomes burdensome
- **Acquisition**: Potential acquisition by larger agricultural software company
- **Subscription Model**: Convert to freemium if user base grows significantly

---

## Next Steps

1. **Continue Web Development**: Focus on perfecting egg tracking features
2. **Monitor This Document**: Update as web app architecture evolves
3. **Set Extraction Trigger**: Decide when web app is ready for mobile extraction
4. **Prepare Environment**: Install React Native development tools when ready

This plan ensures maximum code reuse while maintaining complete separation between web and mobile development efforts.