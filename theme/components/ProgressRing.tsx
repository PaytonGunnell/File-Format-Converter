import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../ThemeProvider';
import { spacing } from '../spacing';

export interface ProgressRingProps {
  /** Progress value from 0 to 1. Values outside this range are clamped. */
  progress: number;
  /** Size of the ring in pixels. */
  size?: number;
  /** Stroke width in pixels. */
  strokeWidth?: number;
  /** Color of the progress indicator. */
  color?: string;
  /** Background track color. */
  trackColor?: string;
  /** Accessibility label for the progress state. */
  accessibilityLabel?: string;
}

const ProgressRing = ({
  progress,
  size = 48,
  strokeWidth = 4,
  color,
  trackColor,
  accessibilityLabel,
}: ProgressRingProps) => {
  const theme = useTheme();

  const resolvedColor = color ?? theme.colors.primary;
  const resolvedTrackColor = trackColor ?? theme.colors.surfaceElevated;

  // Clamp progress to [0, 1].
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Calculate the radius of the circle.
  const radius = (size - strokeWidth) / 2;

  // Calculate the circumference of the full circle.
  const circumference = 2 * Math.PI * radius;

  // Calculate the stroke dash offset (0 at 0 progress, full circumference at 100%).
  const strokeDashOffset = circumference * (1 - clampedProgress);

  // Accessibility value as percentage.
  const progressPercent = Math.round(clampedProgress * 100);
  const a11yLabel = accessibilityLabel ?? `Progress: ${progressPercent}%`;

  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={a11yLabel}
    >
      <Svg width={size} height={size}>
        {/* Background track (full circle). */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={resolvedTrackColor}
          fill="transparent"
        />
        {/* Progress indicator (animated via Reanimated or CSS). */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={resolvedColor}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashOffset}
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressRing;