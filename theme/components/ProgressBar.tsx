import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { spacing } from '../spacing';
import { radii } from '../radii';

export interface ProgressBarProps {
  /** Progress value from 0 to 1. Values outside this range are clamped. */
  progress: number;
  /** Width of the progress bar. If height is set, width scales proportionally. */
  width?: number;
  /** Height of the progress bar. */
  height?: number;
  /** Color of the progress indicator. */
  color?: string;
  /** Background track color. */
  trackColor?: string;
  /** Accessibility label for the progress state. */
  accessibilityLabel?: string;
}

const ProgressBar = ({
  progress,
  width,
  height = 8,
  color,
  trackColor,
  accessibilityLabel,
}: ProgressBarProps) => {
  const theme = useTheme();

  const resolvedColor = color ?? theme.colors.primary;
  const resolvedTrackColor = trackColor ?? theme.colors.surfaceElevated;

  // Clamp progress to [0, 1].
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Calculate the fill width based on progress.
  const effectiveWidth = width ?? 200;
  const fillWidth = clampedProgress * effectiveWidth;

  // Accessibility value as percentage.
  const progressPercent = Math.round(clampedProgress * 100);
  const a11yLabel = accessibilityLabel ?? `Progress: ${progressPercent}%`;

  const trackStyle: ViewStyle = {
    width: effectiveWidth,
    height,
    backgroundColor: resolvedTrackColor,
    borderRadius: radii.pill,
    overflow: 'hidden',
  };

  const fillStyle: ViewStyle = {
    width: fillWidth,
    height: '100%',
    backgroundColor: resolvedColor,
    borderRadius: radii.pill,
  };

  return (
    <View
      style={styles.wrapper}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={a11yLabel}
    >
      <View style={trackStyle}>
        <View style={fillStyle} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressBar;