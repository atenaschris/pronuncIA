import { generateIntelligentMockPlan } from '../helpers/lesson-generation-utils';
import type { PerformanceMetrics, SpacedRepetitionData } from '../helpers/performance-utils';
import type { DailyPlan } from '../store/lesson-store';
import { aiService } from './ai-service';

export interface PlanningOnboardingData {
  languageLevel: string;
  nativeLanguage: string;
  learningGoal: string;
  timeCommitment: string;
  learningStyle: string;
  targetLanguage?: string;
}

/**
 * Centralized orchestration for daily plan generation.
 * Tries AI first; falls back to deterministic intelligent mock plan on failure.
 */
export const generateDailyPlanWithFallback = async (
  prompt: string,
  onboardingData: PlanningOnboardingData,
  performanceMetrics: PerformanceMetrics,
  spacedRepetitionData: SpacedRepetitionData,
  date: string
): Promise<DailyPlan> => {
  try {
    return await aiService.generateDailyPlan(prompt);
  } catch (error) {
    return generateIntelligentMockPlan(
      onboardingData,
      performanceMetrics,
      spacedRepetitionData,
      date
    );
  }
};