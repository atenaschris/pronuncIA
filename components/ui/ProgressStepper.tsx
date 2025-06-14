import { useTheme } from '@rneui/themed';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { RNEText } from './RNEText';

interface ProgressStepperProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  stepsWithErrors: number[];
  size?: 'small' | 'medium' | 'large';
  isReplaying?: boolean;
}

// Wrap the component with React.memo to prevent unnecessary re-renders
const ProgressStepper = React.memo(function ProgressStepperComponent({
  totalSteps,
  currentStep,
  completedSteps,
  stepsWithErrors,
  size = 'medium',
  isReplaying = false
}: ProgressStepperProps) {
  const { theme } = useTheme();
  console.log('re-rendered ProgressStepper')
  const getStepColor = useCallback((stepIndex: number) => {
    debugger;
    // If current step with errors, show error color
    if (stepIndex === currentStep && stepsWithErrors.includes(stepIndex)) {
      return theme.colors.error;
    }
    
    // If current step without errors, show primary color
    if (stepIndex === currentStep) {
      return theme.colors.primary;
    }
    
    // If completed step
    if (completedSteps.includes(stepIndex)) {
      // If replaying and this is the current step, show primary
      if (isReplaying && stepIndex === currentStep) {
        return theme.colors.primary;
      }
      // If completed with errors, show red
      if (stepsWithErrors.includes(stepIndex)) {
        return theme.colors.error;
      }
      // If completed with no errors, show green
      return theme.colors.success;
    }
    
    // If not completed, show grey
    return theme.colors.grey4;
  }, [completedSteps, stepsWithErrors, currentStep, isReplaying, theme.colors]);
  
  const getStepSize = useCallback(() => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24, borderRadius: 12 };
      case 'large':
        return { width: 40, height: 40, borderRadius: 20 };
      default:
        return { width: 32, height: 32, borderRadius: 16 };
    }
  }, [size]);
  
  const getTextSize = useCallback(() => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 16;
      default:
        return 12;
    }
  }, [size]);
  
  const getConnectorHeight = useCallback(() => {
    switch (size) {
      case 'small':
        return 2;
      case 'large':
        return 4;
      default:
        return 3;
    }
  }, [size]);
  
  const stepSize = getStepSize();
  const textSize = getTextSize();
  const connectorHeight = getConnectorHeight();
  
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepColor = getStepColor(index);
          const isLastStep = index === totalSteps - 1;
          
          return (
            <View key={index} style={styles.stepWrapper}>
              <View
                style={[
                  styles.step,
                  stepSize,
                  { backgroundColor: stepColor }
                ]}
              >
                <RNEText
                  style={[
                    styles.stepText,
                    {
                      fontSize: textSize,
                      color: completedSteps.includes(index) || index === currentStep
                        ? theme.colors.white
                        : theme.colors.grey2
                    }
                  ]}
                >
                  {index + 1}
                </RNEText>
              </View>
              
              {!isLastStep && (
                <View
                  style={[
                    styles.connector,
                    {
                      height: connectorHeight,
                      backgroundColor: (() => {
                        // If replaying and this is the current step, show primary
                        if (isReplaying && index === currentStep) {
                          return theme.colors.primary;
                        }
                        // If completed step, show success color
                        if (completedSteps.includes(index)) {
                          return theme.colors.success;
                        }
                        // Default grey for incomplete steps
                        return theme.colors.grey4;
                      })()
                    }
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  stepText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connector: {
    width: 24,
    marginHorizontal: 4,
  },
});

// Export the memoized component
export { ProgressStepper };
