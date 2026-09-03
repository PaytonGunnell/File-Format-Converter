// Type shim for expo-file-system to handle cacheDirectory access
// This module adds proper typing for the static cacheDirectory property

declare module "expo-file-system" {
  // The static props that may exist on runtime but not in types
  export interface FileSystemStatic {
    cacheDirectory?: string;
    documentDirectory?: string;
  }
}

// Re-export everything from expo-file-system
export * from "expo-file-system";
