import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { spacing } from '../spacing';
import { radii } from '../radii';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export interface AppButtonProps {
  /** Button label text. */
  label: string;
  /** Visual variant. */
  variant?: AppButtonVariant;
  /** Show inline spinner, swapping the label without resizing. */
  loading?: boolean;
  /** Disable interaction and show a muted state. */
  disabled?: boolean;
  /** onPress handler. */
  onPress?: (event: GestureResponderEvent) => void;
  /** Accessibility label override (defaults to label). */
  accessibilityLabel?: string;
  /** Accessibility hint. */
  accessibilityHint?: string;
}

const AppButton = ({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: AppButtonProps) => {
  const theme = useTheme();

  const backgroundColor = getBackgroundColor(variant, theme);
  const textColor = getTextColor(variant, theme);
  const opacity = disabled ? 0.4 : 1;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          opacity,
          minHeight: 44, // 44pt minimum hit target
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
          style={styles.spinner}
        />
      ) : null}
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

// Resolve the background color based on variant + theme.
function getBackgroundColor(variant: AppButtonVariant, theme: any): string {
  switch (variant) {
    case 'primary':
      return theme.colors.primary;
    case 'secondary':
      return theme.colors.surfaceElevated;
    case 'ghost':
      return 'transparent';
    case 'destructive':
      return theme.colors.error;
    default:
      return theme.colors.primary;
  }
}

// Resolve the text color based on variant + theme.
function getTextColor(variant: AppButtonVariant, theme: any): string {
  switch (variant) {
    case 'ghost':
    case 'secondary':
    case 'destructive':
      return variant === 'destructive'
        ? '#FFFFFF' // Always white text on error red
        : theme.colors.textPrimary;
    default:
      return '#FFFFFF'; // Always white text on colored backgrounds
  }
}

const styles = StyleSheet.create<{
  button: ViewStyle;
  label: TextStyle;
  spinner: ViewStyle;
}>({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    gap: spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  spinner: {
    position: 'absolute',
    left: spacing.md,
  },
});

export default AppButton;
