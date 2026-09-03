import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { spacing } from '../spacing';
import { radii } from '../radii';

export type FormatValue = 'mp4' | 'mov' | 'avi' | 'mp3' | 'wav';

export interface FormatOption {
  label: string;
  value: FormatValue;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { label: 'MP4', value: 'mp4' },
  { label: 'MOV', value: 'mov' },
  { label: 'AVI', value: 'avi' },
  { label: 'MP3', value: 'mp3' },
  { label: 'WAV', value: 'wav' },
];

export type FormatChipVariant = 'default' | 'selected' | 'disabled';

export interface FormatChipProps {
  /** Format label to display (e.g. "MP4"). */
  label: string;
  /** Format value (e.g. "mp4"). */
  value: FormatValue;
  /** Visual state variant. */
  variant?: FormatChipVariant;
  /** Whether this chip is currently selected. */
  selected?: boolean;
  /** Whether this chip is disabled (e.g. incompatible with source type). */
  disabled?: boolean;
  /** onPress handler. */
  onPress?: (event: GestureResponderEvent) => void;
  /** Accessibility hint. */
  accessibilityHint?: string;
}

const FormatChip = ({
  label,
  value,
  variant = 'default',
  selected = false,
  disabled = false,
  onPress,
  accessibilityHint,
}: FormatChipProps) => {
  const theme = useTheme();

  const isDisabled = disabled || variant === 'disabled';

  const backgroundColor = getBackgroundColor(theme, variant, selected);
  const textColor = getTextColor(theme, variant, selected, isDisabled);
  const borderColor = getBorderColor(theme, variant, selected);
  const opacity = isDisabled ? 0.4 : 1;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
          opacity,
          minHeight: 44, // 44pt minimum hit target
          minWidth: 44,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        selected,
        disabled: isDisabled,
      }}
    >
      <Text
        style={[
          styles.label,
          { color: textColor, fontFamily: theme.fontFamily },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

function getBackgroundColor(
  theme: any,
  variant: FormatChipVariant,
  selected: boolean
): string {
  if (variant === 'selected' || selected) {
    return theme.colors.primary;
  }
  if (variant === 'disabled') {
    return theme.colors.surfaceElevated;
  }
  return theme.colors.surface;
}

function getTextColor(
  theme: any,
  variant: FormatChipVariant,
  selected: boolean,
  isDisabled: boolean
): string {
  if (variant === 'disabled' || isDisabled) {
    return theme.colors.textSecondary;
  }
  if (variant === 'selected' || selected) {
    return '#FFFFFF'; // Always white text on primary
  }
  return theme.colors.textPrimary;
}

function getBorderColor(
  theme: any,
  variant: FormatChipVariant,
  selected: boolean
): string {
  if (variant === 'selected' || selected) {
    return theme.colors.primary;
  }
  return theme.colors.border;
}

const styles = StyleSheet.create<{
  chip: ViewStyle;
  label: TextStyle;
}>({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    margin: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
});

export default FormatChip;
