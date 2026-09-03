// Typography scale. All font sizes and line heights are fixed here so that
// no magic numbers appear elsewhere in the application.
// Sizes use the system default font family (SF Pro / Roboto) via expo-font.

export interface TextStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight:
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | undefined;
}

export interface TypographyTokens {
  displayLarge: TextStyle;
  title: TextStyle;
  subtitle: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  label: TextStyle;
}

export const typography: TypographyTokens = {
  displayLarge: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
};

// The system default font family is used throughout the app.
// On iOS this resolves to SF Pro Text / SF Pro Display;
// on Android it resolves to the system sans-serif.
export const fontFamily = 'System';

export default typography;
