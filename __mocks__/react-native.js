// React Native mock for jsdom testing environments
// Maps React Native components to HTML elements with proper testID support

const React = require('react');

// View component - renders as div
const View = React.forwardRef((props, ref) => {
  const { children, style, testID, ...rest } = props;
  return React.createElement(
    'View',
    { 'data-testid': testID, style: style || {}, ref, ...rest },
    children
  );
});

// Text component - renders as span
const Text = React.forwardRef((props, ref) => {
  const { children, style, testID, ...rest } = props;
  return React.createElement(
    'Text',
    { 'data-testid': testID, style: style || {}, ref, ...rest },
    children
  );
});

// TouchableOpacity - renders as button
const TouchableOpacity = React.forwardRef((props, ref) => {
  const { children, style, testID, onPress, ...rest } = props;
  return React.createElement(
    'TouchableOpacity',
    { 'data-testid': testID, style: style || {}, ref, onClick: onPress, ...rest },
    children
  );
});

// StyleSheet mock - passes styles through
const StyleSheet = {
  create: (styles) => styles,
  flatten: (styles) => styles || {},
  compose: (...args) => args[0] || {},
};

// Platform mock
const Platform = {
  OS: 'web',
  select: (obj) => obj.web || obj.native || obj.default || null,
};

// NativeModules bridge config (required for react-test-renderer)
const __fbBatchedBridgeConfig = {
  initialConfig: {
    dev: true,
    isNewArchEnabled: true,
    fwPackageId: 'com.localfileconverter.app',
    surfaceTypeInitial: 'rl',
    minRootHeight: 10,
    maxRootHeight: 11000,
    maxElementDepth: 7500,
    samplingInterval: 1,
    perfSkewInterval: 0.1,
    pointerEventsEnabled: true,
    useWebWorkers: false,
    wantsMicrotasksEnabled: true,
    wantsSignalsEnabled: false,
    nativeModuleProxy: false,
    isHybrid: false,
    isE2E: false,
    isDetoxTesting: false,
    isHermes: false,
    isInteractionManagerEnabled: false,
    isShakeToSendBugreportEnabled: false,
    isTimezoneDetectionEnabled: false,
    isTremorEnabled: false,
    eslint: false,
    dispatchAsserts: false,
    hostnameForBridge: true,
    isDebuggerConnected: false,
    onBatchComplete: false,
    optOutErrorProcessor: false,
    sendBackchainError: false,
    sendPayloadToModule: false,
    shouldInitializeStrictMode: false,
    useMultithreading: false,
    useMultipleIsolates: false,
    workerState: 'none',
    JSBundleFlags: 0,
    jsHandlerName: 'h',
    base64Encoded: false,
  },
};

module.exports = {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  __fbBatchedBridgeConfig,
};