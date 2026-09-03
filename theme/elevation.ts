// Elevation tokens for surface shadows.
// React Native uses `elevation` (Android) and `shadow*` (iOS).
// These values work for both platforms via StyleSheet.compose and
// react-native-paper's Shadow view, but here we provide simple tokens
// that can be applied consistently.

export interface ElevationTokens {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
}

export const elevation: ElevationTokens = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
};

export default elevation;