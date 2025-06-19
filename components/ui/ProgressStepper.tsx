
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { RNPText } from './RNPText';
import { useAppTheme } from './theme';

interface ProgressStepperProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number[];
  stepsWithErrors: number[];
  size?: 'small' | 'medium' | 'large';
  isReplaying?: boolean;
  isGoingBack?: boolean;
}

// Memoized step component to prevent unnecessary re-renders
const StepItem = React.memo(function StepItem({
  index,
  stepColor,
  stepSize,
  textSize,
  connectorHeight,
  isLastStep,
  completedSteps,
  currentStep,
  theme,
  styles,
  getStepOrConnectorColor,
}: {
  index: number;
  stepColor: string;
  stepSize: any;
  textSize: number;
  connectorHeight: number;
  isLastStep: boolean;
  completedSteps: number[];
  currentStep: number;
  theme: any;
  styles: any;
  getStepOrConnectorColor: (index: number) => string;
}) {
  return (
    <View key={index} style={styles.stepWrapper}>
      <View
        style={[
          styles.step,
          stepSize,
          { backgroundColor: stepColor }
        ]}
      >
        <RNPText
          style={[
            styles.stepText,
            {
              fontSize: textSize,
              color: completedSteps.includes(index) || index === currentStep
                ? theme.colors.onPrimary
                : theme.colors.outline
            }
          ]}
        >
          {index + 1}
        </RNPText>
      </View>
      
      {!isLastStep && (
        <View
          style={[
            styles.connector,
            {
              height: connectorHeight,
              backgroundColor: getStepOrConnectorColor(index)
            }
          ]}
        />
      )}
    </View>
  );
});

// Wrap the component with React.memo to prevent unnecessary re-renders
const ProgressStepper = React.memo(function ProgressStepperComponent({
  totalSteps,
  currentStep,
  completedSteps,
  stepsWithErrors,
  size = 'medium',
  isReplaying = false,
  isGoingBack = false,
}: ProgressStepperProps) {
  const theme = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  console.log('re-rendered ProgressStepper')
  const getStepOrConnectorColor = useCallback((stepIndex: number) => {
    // If completed step
    if (completedSteps.includes(stepIndex)) {
      // If completed with errors, show red (highest priority)
      if (stepsWithErrors.includes(stepIndex)) {
        return theme.colors.error;
      }
      // Special case: if going back and this is the current step, show primary instead of success
      if (isGoingBack && stepIndex === currentStep) {
        return theme.colors.primary;
      }
      // If replaying and this is the current step, show primary
      if (isReplaying && stepIndex === currentStep && !stepsWithErrors.includes(stepIndex)) {
        return theme.colors.primary;
      }
      // If completed with no errors, show green
      return '#4CAF50'; // Using a standard success color
    }
    
    // If current step with errors, show error color
    if (stepIndex === currentStep && stepsWithErrors.includes(stepIndex)) {
      return theme.colors.error;
    }
    
    // If current step without errors, show primary color
    if (stepIndex === currentStep) {
      return theme.colors.primary;
    }
    
    // If not completed, show grey
    return theme.colors.surfaceVariant;
  }, [completedSteps, stepsWithErrors, currentStep, isReplaying, theme.colors, isGoingBack]);
  
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
  
  // Memoize computed values to prevent recalculation on scroll events
  const stepSize = useMemo(() => getStepSize(), [getStepSize]);
  const textSize = useMemo(() => getTextSize(), [getTextSize]);
  const connectorHeight = useMemo(() => getConnectorHeight(), [getConnectorHeight]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // Memoize step data to prevent recalculation on scroll events
  const stepData = useMemo(() => {
    return Array.from({ length: totalSteps }, (_, index) => ({
      index,
      stepColor: getStepOrConnectorColor(index),
      isLastStep: index === totalSteps - 1,
    }));
  }, [totalSteps, getStepOrConnectorColor]);
  
  // Calculate if content needs scrolling
  const stepWidth = stepSize.width + 8; // step + margins
  const connectorWidth = 32; // connector + margins
  const totalContentWidth = (stepWidth * totalSteps) + (connectorWidth * (totalSteps - 1));
  const needsScrolling = totalContentWidth > screenWidth - 40; // minus container padding
  
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const maxScrollX = contentSize.width - layoutMeasurement.width;
    
    setShowLeftIndicator(scrollX > 10);
    setShowRightIndicator(scrollX < maxScrollX - 10);
  }, []);
  
  const handleContentSizeChange = useCallback((contentWidth: number) => {
    if (needsScrolling) {
      setShowRightIndicator(contentWidth > screenWidth - 40);
    }
  }, [needsScrolling, screenWidth]);

  // Auto-scroll to keep current step visible
  useEffect(() => {
    if (!needsScrolling || !scrollViewRef.current) return;

    const stepWidth = stepSize.width + 8; // step + margins
    const connectorWidth = 32; // connector + margins
    const stepPosition = currentStep * (stepWidth + connectorWidth);
    const containerWidth = screenWidth - 40; // minus container padding

    // Calculate the ideal scroll position to center the current step
    const idealScrollX = stepPosition - (containerWidth / 2) + (stepWidth / 2);
    
    // Ensure we don't scroll beyond the content bounds
    const maxScrollX = totalContentWidth - containerWidth;
    const targetScrollX = Math.max(0, Math.min(idealScrollX, maxScrollX));

    // Smooth scroll to the target position
    scrollViewRef.current.scrollTo({
      x: targetScrollX,
      animated: true,
    });
  }, [currentStep, needsScrolling, stepSize.width, screenWidth, totalContentWidth]);
  
  return (
    <View style={styles.container}>
      {/* Left scroll indicator */}
      {needsScrolling && showLeftIndicator && (
        <View style={[styles.scrollIndicator, styles.leftIndicator]}>
          <RNPText style={[styles.indicatorText]}>‹</RNPText>
        </View>
      )}
      
      {/* Right scroll indicator */}
      {needsScrolling && showRightIndicator && (
        <View style={[styles.scrollIndicator, styles.rightIndicator]}>
          <RNPText style={[styles.indicatorText]}>›</RNPText>
        </View>
      )}
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.stepsContainer,
          !needsScrolling && styles.centeredContent
        ]}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
      >
        {stepData.map(({ index, stepColor, isLastStep }) => (
          <StepItem
            key={index}
            index={index}
            stepColor={stepColor}
            stepSize={stepSize}
            textSize={textSize}
            connectorHeight={connectorHeight}
            isLastStep={isLastStep}
            completedSteps={completedSteps}
            currentStep={currentStep}
            theme={theme}
            styles={styles}
            getStepOrConnectorColor={getStepOrConnectorColor}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  centeredContent: {
    justifyContent: 'center',
    flexGrow: 1,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: theme.colors.black,
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
  scrollIndicator: {
    position: 'absolute',
    top: '65%',
    zIndex: 1,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    elevation: 3,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  leftIndicator: {
    left: 5,
  },
  rightIndicator: {
    right: 5,
  },
  indicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 16,
    includeFontPadding: false,
  },
});

// Export the memoized component
export { ProgressStepper };

