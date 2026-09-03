# Jest Mocks Directory

This directory contains custom Jest mocks for the Local File Converter project.

## react-native.js

Custom React Native component mocks that render HTML elements for jsdom testing:

- **View** → renders as `<div>` with `data-testid` support
- **Text** → renders as `<span>` with `data-testid` support  
- **TouchableOpacity** → renders as `<button>` with `data-testid` and `onClick` support
- **StyleSheet** → passes through styles (useful for debugging)
- **Platform** → returns 'web' as OS

**Important**: All components must use string type ('Text', 'View') so RNTL's `isHostText` check works correctly in the Web project.