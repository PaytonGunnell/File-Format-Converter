// Type declaration for @sheehanmunim/react-native-ffmpeg
// This package re-exports everything from ffmpeg-kit-react-native and 
// auto-applies the smart-exception-java fix on import.
// We declare it here so TypeScript can resolve the module even though
// @sheehanmunim/react-native-ffmpeg doesn't ship its own types.

declare module "@sheehanmunim/react-native-ffmpeg" {
  // Re-export all types from ffmpeg-kit-react-native
  // The actual module re-exports everything via `module.exports = require("ffmpeg-kit-react-native")`
  // so all static methods and types are available.
  export * from "ffmpeg-kit-react-native";

  // FFmpegKit is the main class - re-exported from ffmpeg-kit-react-native
  export class FFmpegKit {
    static execute(command: string): Promise<FFmpegSession>;
    static executeWithArguments(commandArguments: string[]): Promise<FFmpegSession>;
    static executeAsync(command: string, completeCallback?: FFmpegSessionCompleteCallback, logCallback?: LogCallback, statisticsCallback?: StatisticsCallback): Promise<FFmpegSession>;
    static executeWithArgumentsAsync(commandArguments: string[], completeCallback?: FFmpegSessionCompleteCallback, logCallback?: LogCallback, statisticsCallback?: StatisticsCallback): Promise<FFmpegSession>;
    static cancel(sessionId?: number): Promise<void>;
    static listSessions(): Promise<FFmpegSession[]>;
  }
}
