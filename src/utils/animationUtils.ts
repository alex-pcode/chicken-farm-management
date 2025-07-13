/**
 * Utility functions for consistent animation container styling across components
 */

// Base animation container classes
const BASE_CLASSES = "relative w-full overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg";

// Mobile margin variations
const MARGIN_LARGE = "mt-[60px] sm:mt-0";  // For Profile, Expenses, FeedTracker
const MARGIN_MEDIUM = "mt-[20px] sm:mt-0"; // For EggCounter

// Background gradient variations
const GRADIENT_GREEN = "bg-gradient-to-b from-blue-100 to-green-100";
const GRADIENT_GOLD = "bg-gradient-to-b from-blue-100 to-yellow-100";

// Height variations
const HEIGHT_STANDARD = "h-48"; // 192px
const HEIGHT_TALL = "h-64";     // 256px

/**
 * Get animation container classes for standard height with green gradient (medium margin)
 * Used by: EggCounter
 */
export const getStandardAnimationClasses = () => {
  return `${BASE_CLASSES} ${MARGIN_MEDIUM} ${HEIGHT_STANDARD} ${GRADIENT_GREEN}`;
};

/**
 * Get animation container classes for tall height with green gradient (large margin)
 * Used by: Profile (AnimatedFarm)
 */
export const getTallAnimationClasses = () => {
  return `${BASE_CLASSES} ${MARGIN_LARGE} ${HEIGHT_TALL} ${GRADIENT_GREEN}`;
};

/**
 * Get animation container classes for standard height with gold gradient (large margin)
 * Used by: Expenses (AnimatedCoin)
 */
export const getGoldAnimationClasses = () => {
  return `${BASE_CLASSES} ${MARGIN_LARGE} ${HEIGHT_STANDARD} ${GRADIENT_GOLD}`;
};

/**
 * Get animation container classes for feed tracker (large margin)
 * Used by: FeedTracker
 */
export const getFeedTrackerAnimationClasses = () => {
  return `${BASE_CLASSES} ${MARGIN_LARGE} ${HEIGHT_STANDARD} ${GRADIENT_GREEN}`;
};

/**
 * Custom animation container classes for specific needs
 */
export const getCustomAnimationClasses = (height: 'standard' | 'tall', gradient: 'green' | 'gold') => {
  const heightClass = height === 'tall' ? HEIGHT_TALL : HEIGHT_STANDARD;
  const gradientClass = gradient === 'gold' ? GRADIENT_GOLD : GRADIENT_GREEN;
  return `${BASE_CLASSES} ${heightClass} ${gradientClass}`;
};
