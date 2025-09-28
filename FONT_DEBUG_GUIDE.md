# Font Loading Debug Guide

## Quick Testing Commands

Open browser console on your site and run these commands:

### 1. Basic Font Check
```javascript
// Check if fonts are loaded
fontDebugUtils.checkFont('Fraunces', '400')
fontDebugUtils.checkFont('Fraunces', '600')

// Check what font is actually being used
fontTestUtils.checkCurrentFont('body')
fontTestUtils.checkCurrentFont('h1')
```

### 2. Run Comprehensive Test
```javascript
// Run full font loading test
fontTestUtils.runTest()
```

### 3. Enable Debug Mode
```javascript
// Enable detailed font loading logs
fontDebugUtils.enableDebugMode()
```

### 4. Compare Local vs Production
```javascript
// Run this in both environments to compare
fontTestUtils.compareEnvironments()
```

## What to Look For

### ✅ Success Indicators
- Console shows: `🎨 Critical font loaded: normal 400 16px Fraunces`
- Font test reports: `✅ All fonts loading and applying correctly`  
- `fontTestUtils.checkCurrentFont()` shows `isUsingFraunces: true`

### ❌ Problem Indicators
- Console warnings: `⚠️ Critical font load failed`
- Font test reports failures
- `isUsingFraunces: false` in current font check
- Preload warnings in Network tab

## Debugging Steps

1. **Check Network Tab**
   - All font files should show 200 OK
   - No 404 errors for font files

2. **Check Console Logs**  
   - Look for font loading debug messages
   - Check for any JavaScript errors

3. **Compare Environments**
   - Run tests in both local and production
   - Look for timing differences

## Expected Console Output

### On Page Load:
```
🎨 Font Loading Debugger initialized
🎨 Font Debug [font-face-added]: Fraunces
🎨 Critical font loaded: normal 400 16px Fraunces
🎨 Critical font loaded: normal 600 16px Fraunces
🎨 Font loading complete: true
✅ All font tests passed!
```

## Troubleshooting Common Issues

### Issue: Fonts load but don't display
**Cause**: CSS specificity conflict
**Solution**: Check for conflicting font-family declarations

### Issue: Slow font loading in production
**Cause**: CDN/network latency  
**Solution**: Implemented font preloading and fetchpriority="high"

### Issue: Preload warnings
**Cause**: Fonts load after they're needed
**Solution**: Implemented immediate font loading script

## Files Modified

1. `index.html` - Font preloading and @font-face declarations
2. `src/main.tsx` - Font loading initialization
3. `src/utils/fontDebugger.ts` - Debug utilities
4. `src/utils/fontOptimizer.ts` - Loading optimizations  
5. `src/utils/fontTester.ts` - Testing utilities
6. `src/styles/critical/inline-hero.css` - Removed conflicting font-display

## Next Steps

1. Deploy these changes to production
2. Test on production site using the console commands above
3. Compare results with local environment
4. Monitor for any remaining font loading issues

The solution implements multiple strategies:
- **Immediate loading**: Forces font loading before render
- **High priority preloading**: Uses fetchpriority="high" 
- **Font-display optimization**: Changed from swap to block
- **CSS conflict resolution**: Removed conflicting font-display rules
- **Comprehensive debugging**: Detailed logging and testing utilities