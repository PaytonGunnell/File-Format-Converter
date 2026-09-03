// Jest setup file
import '@react-native/jest-preset';

// Silence console.warn during tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
