import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { radii } from '../radii';
import { spacing } from '../spacing';

import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetBackdrop,
  BottomSheetHandle,
} from '@gorhom/bottom-sheet';

// Re-export the bottom-sheet components so consumers can import from here.
export {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetFlatList,
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetFooter,
  BottomSheetModalProvider,
  useBottomSheet,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';

export type {
  BottomSheetModalProps,
  BottomSheetProps,
  BottomSheetHandleProps,
  BottomSheetBackgroundProps,
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';

const DEFAULT_SNAP_POINTS = ['25%', '50%', '75%'];
const DEFAULT_ANIMATE_ON_MOUNT = true;
const DEFAULT_DETACH_FROM_SCROLL = true;

export interface AppBottomSheetProps extends Omit<BottomSheetModalProps, 'ref'> {
  /** Snap points for the sheet. Defaults to the app-standard set. */
  snapPoints?: string[];
  /** Enable/disable the standard backdrop. */
  enableBackdrop?: boolean;
  /** Enable/disable the drag handle. */
  enableHandle?: boolean;
}

// A forward-ref wrapper that applies the app's corner radius, backdrop
// opacity, and default snap points so every future sheet inherits the same
// motion and styling.
const AppBottomSheet = React.forwardRef<any, AppBottomSheetProps>(
  (
    {
      snapPoints = DEFAULT_SNAP_POINTS,
      animateOnMount = DEFAULT_ANIMATE_ON_MOUNT,
      detached = DEFAULT_DETACH_FROM_SCROLL,
      enableBackdrop = true,
      enableHandle = true,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();

    const renderBackdrop = enableBackdrop
      ? (props: any) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.48}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )
      : undefined;

    const renderHandle = enableHandle
      ? (props: any) => <BottomSheetHandle {...props} />
      : undefined;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        animateOnMount={animateOnMount}
        detached={detached}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        style={styles.sheet}
        backgroundStyle={{ backgroundColor: theme.colors.surface }}
        handleStyle={{ backgroundColor: theme.colors.border }}
        {...rest}
      />
    );
  }
);

AppBottomSheet.displayName = 'AppBottomSheet';

const styles = StyleSheet.create<{
  sheet: ViewStyle;
}>({
  sheet: {
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    paddingBottom: spacing.sm,
  },
});

export default AppBottomSheet;
