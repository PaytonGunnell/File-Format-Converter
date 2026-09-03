import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { spacing } from '../spacing';
import { radii } from '../radii';

export interface ToastProps {
  /** Toast message to display. */
  message: string;
  /** Duration in milliseconds to show the toast. */
  duration?: number;
  /** Called when toast should be dismissed (e.g., auto-hide or manual close). */
  onDismiss?: () => void;
  /** Accessibility label override. */
  accessibilityLabel?: string;
}

interface ToastState {
  visible: boolean;
  message: string;
}

type ShowToast = (message: string, duration?: number) => void;
type HideToast = () => void;

// Global toast state managed by a context.
const ToastContext = React.createContext<{ show: ShowToast }>({ show: () => {} });

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ToastState>({ visible: false, message: '' });
  const [currentDuration, setCurrentDuration] = useState(3000);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (message: string, duration = 3000) => {
    setState({ visible: true, message });
    setCurrentDuration(duration);
  };
  const hide = () => {
    setState((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (state.visible && currentDuration > 0) {
      timeoutRef.current = setTimeout(() => {
        hide();
      }, currentDuration);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.visible, currentDuration]);

  return (
    <ToastContext.Provider value={{ show: notify }}>
      {children}
      <ToastView state={state} onDismiss={hide} />
    </ToastContext.Provider>
  );
};

interface ToastViewState {
  visible: boolean;
  message: string;
}

const ToastView = ({
  state,
  onDismiss,
}: {
  state: ToastViewState;
  onDismiss: () => void;
}) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [state.visible, opacity]);

  if (!state.visible) return null;

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: theme.colors.surfaceElevated, opacity }]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={state.message}
    >
      <Text style={[styles.message, { color: theme.colors.textPrimary, fontFamily: theme.fontFamily }]}>
        {state.message}
      </Text>
      <TouchableOpacity onPress={onDismiss}>
        <Text style={[styles.close, { color: theme.colors.textSecondary }]}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const useToast = () => React.useContext(ToastContext);

const styles = StyleSheet.create<{
  toast: ViewStyle;
  message: TextStyle;
  close: TextStyle;
}>({
  toast: {
    position: 'absolute',
    bottom: 32,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  close: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export { ToastProvider };
export default ToastView;