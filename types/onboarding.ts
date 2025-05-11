export interface OnboardingOption<T extends string> {
  id: T;
  label: string;
  description: string;
}