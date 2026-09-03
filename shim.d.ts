// Type shim for expo-file-system cacheDirectory access
// Export a typed constant for FileSystem.cacheDirectory
import { Paths, Directory } from "expo-file-system";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var cacheDirectory: string | undefined;
}

// Compute the cache directory at module load time if the static property exists
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const cache = (exports as any).cacheDirectory || undefined;
// (exports as any).cacheDirectory = cache;

export { cache as cacheDirectory };
