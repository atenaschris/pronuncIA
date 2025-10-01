/**
 * Date and streak utility functions
 * Extracted from lesson-store.ts for better code organization
 */

// Helper function to check if two dates are consecutive days
export const areConsecutiveDays = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Calculate the gap size in days between two dates
export const calculateGapDays = (lastDate: string, currentDate: string): number => {
  const d1 = new Date(lastDate);
  const d2 = new Date(currentDate);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1; // Subtract 1 to get actual gap days
};

// Calculate how many streak freezes are needed to cover a gap
export const calculateFreezesNeeded = (gapDays: number): number => {
  const MAX_GAP_PER_FREEZE = 3; // Each freeze can cover up to 3 days
  return Math.ceil(gapDays / MAX_GAP_PER_FREEZE);
};

// Check if a gap can be covered by available freezes
export const canCoverGap = (gapDays: number, availableFreezes: number): boolean => {
  const MAX_TOTAL_GAP_COVERAGE = 9; // Maximum 9 days can be covered total (3 freezes × 3 days each)
  if (gapDays > MAX_TOTAL_GAP_COVERAGE) return false;
  return calculateFreezesNeeded(gapDays) <= availableFreezes;
};

// Helper function to calculate lesson count based on time commitment
export const calculateLessonCount = (timeCommitment: number): number => {
  if (timeCommitment <= 15) return 3;
  if (timeCommitment <= 30) return 5;
  if (timeCommitment <= 45) return 7;
  return 9;
};