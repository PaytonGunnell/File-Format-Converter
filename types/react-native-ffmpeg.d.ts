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

  // ReturnCode class - for check
  export class ReturnCode {
    static readonly SUCCESS: number;
    static readonly CANCEL: number;
    static isSuccess(returnCode: unknown): boolean;
    static isCancel(returnCode: unknown): boolean;
    getValue(): number;
    isValueSuccess(): boolean;
  }

  // FFmpegSession interface
  export interface FFmpegSession {
    getReturnCode(): Promise<ReturnCode>;
    getSessionId(): number;
    getAllLogsAsString(waitTimeout?: number): Promise<string>;
    getFailStackTrace(): Promise<string>;
    getLogRedirectionStrategy(): unknown;
    getLogsAsString(): Promise<string>;
    getState(): Promise<unknown>;
  }

  // FFmpegSessionCompleteCallback
  export type FFmpegSessionCompleteCallback = (session: FFmpegSession) => void;

  // LogCallback
  export type LogCallback = (log: unknown) => void;

  // StatisticsCallback
  export type StatisticsCallback = (statistics: unknown) => void;

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
