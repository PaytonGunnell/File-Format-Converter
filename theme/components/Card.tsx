import React, { ReactNode } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Text,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { spacing } from '../spacing';
import { radii } from '../radii';
import { elevation } from '../elevation';

export interface CardProps {
  /** Card content. */
  children: ReactNode;
  /** Padding within the card. */
  padding?: 'xs' | 'sm' | 'md' | 'lg';
  /** Card title (optional, renders as a header row). */
  title?: string;
  /** Called when the card is pressed. */
  onPress?: () => void;
  /** Test ID for testing. */
  testID?: string;
  /** Accessibility label. */
  accessibilityLabel?: string;
}

const paddingMap = {
  xs: spacing.xs,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
};

const Card = ({
  children,
  padding = 'md',
  title,
  onPress,
  testID,
  accessibilityLabel,
}: CardProps) => {
  const theme = useTheme();
  const cardPadding = paddingMap[padding];

  const containerStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: radii.md,
    padding: cardPadding,
    minHeight: 44,
  };

  // Apply elevation (Android) and shadow (iOS).
  const shadowStyle: ViewStyle = {
    shadowColor: theme.colors.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: elevation.sm,
  };

  const content = (
    <View style={StyleSheet.flatten([styles.content, containerStyle, shadowStyle])}>
      {title ? (
        <Text
          style={[styles.title, { color: theme.colors.textPrimary, fontFamily: theme.fontFamily }]}
          accessibilityRole="header"
        >
          {title}
        </Text>
      ) : null}
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.8} // pressed-state opacity change
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={styles.wrapper}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // Wrapper for shadow overflow on iOS.
    shadowColor: 'transparent',
  },
  content: {
    borderRadius: 12,
  },
  childrenContainer: {
    marginTop: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
});

export default Card;