import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { FFmpegKit, ReturnCode } from "@sheehanmunim/react-native-ffmpeg";
import { Paths } from "expo-file-system";

import {
  useTheme,
  AppButton,
  FormatChip,
  spacing,
  radii,
  typography,
  elevation,
} from "../theme";

// Use legacy require for FileSystem to access legacy cacheDirectory as fallback
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const FileSystemLegacy = require("expo-file-system/legacy");

// All supported format options (without as const for flexibility in type assignment)
const ALL_FORMAT_OPTIONS = [
  // Video output formats
  { label: "MP4", value: "mp4", mimeType: "video/mp4", group: "video", defaultFor: "video" },
  { label: "MOV", value: "mov", mimeType: "video/quicktime", group: "video" },
  { label: "AVI", value: "avi", mimeType: "video/x-msvideo", group: "video" },
  // Audio output formats
  { label: "MP3", value: "mp3", mimeType: "audio/mpeg", group: "audio", defaultFor: "audio" },
  { label: "WAV", value: "wav", mimeType: "audio/wav", group: "audio", defaultFor: "audio" },
  { label: "AAC", value: "aac", mimeType: "audio/aac", group: "audio" },
];

// Image format options (separate because they have different MIME handling)
const IMAGE_FORMAT_OPTIONS = [
  { label: "JPG", value: "jpg", mimeType: "image/jpeg", group: "image", defaultFor: "image" },
  { label: "PNG", value: "png", mimeType: "image/png", group: "image" },
  { label: "WEBP", value: "webp", mimeType: "image/webp", group: "image" },
];

// Combined format options for selector rendering (video + audio only for now; images get their own)
const VIDEO_AUDIO_FORMATS = ALL_FORMAT_OPTIONS; // Used for video/audio inputs

// All formats (for image inputs)
const ALL_FORMATS = [...ALL_FORMAT_OPTIONS, ...IMAGE_FORMAT_OPTIONS];

// Determine the input file category (video, audio, or image) from mimeType or extension
const getFileCategory = (mimeType: string | undefined, fileName: string): "video" | "audio" | "image" | null => {
  if (!mimeType && !fileName) return null;

  // Check MIME type first
  if (mimeType) {
    const lowerMime = mimeType.toLowerCase();
    if (lowerMime.startsWith("video/")) return "video";
    if (lowerMime.startsWith("audio/")) return "audio";
    if (lowerMime.startsWith("image/")) return "image";
  }

  // Fallback to file extension
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const videoExts = ["mp4", "mov", "avi", "mkv", "webm", "wmv", "flv", "m4v", "3gp"];
  const audioExts = ["mp3", "wav", "aac", "m4a", "ogg", "flac", "wma", "aiff"];
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "tif", "svg"];

  if (videoExts.includes(ext)) return "video";
  if (audioExts.includes(ext)) return "audio";
  if (imageExts.includes(ext)) return "image";

  return null;
};

// Get default format for a given category
const getDefaultFormatForCategory = (category: "video" | "audio" | "image" | null): string => {
  if (!category) return "mp4"; // fallback

  if (category === "video") return "mp4";
  if (category === "audio") return "mp3";
  if (category === "image") return "jpg";

  return "mp4";
};

// Get valid format options for a given input category
const getValidFormatsForCategory = (category: "video" | "audio" | "image" | null): typeof ALL_FORMAT_OPTIONS => {
  if (!category) return ALL_FORMAT_OPTIONS; // fallback to all

  if (category === "video") {
    // Video: allow conversion to MP4, MOV, AVI, and extraction to MP3, WAV
    return ALL_FORMAT_OPTIONS.filter((f) =>
      f.value === "mp4" || f.value === "mov" || f.value === "avi" ||
      f.value === "mp3" || f.value === "wav"
    );
  }

  if (category === "audio") {
    // Audio: allow conversion to MP3, WAV, AAC
    return ALL_FORMAT_OPTIONS.filter((f) =>
      f.value === "mp3" || f.value === "wav" || f.value === "aac"
    );
  }

  if (category === "image") {
    // Image: allow conversion to JPG, PNG, WEBP
    return IMAGE_FORMAT_OPTIONS;
  }

  return ALL_FORMAT_OPTIONS;
};

export default function Page() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileMimeType, setFileMimeType] = useState<string | undefined>(undefined);
  const [fileCategory, setFileCategory] = useState<"video" | "audio" | "image" | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("mp4");
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertedUri, setConvertedUri] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      // Check if it's a successful result (using result.canceled and result.assets)
      if (result && "canceled" in result && result.canceled === false) {
        const assets = result.assets as Array<{ uri: string; name: string; mimeType?: string }>;
        if (assets && assets.length > 0) {
          const asset = assets[0];
          setSelectedFile(asset.uri);
          setFileName(asset.name);
          setFileMimeType(asset.mimeType);

          // Determine file category
          const category = getFileCategory(asset.mimeType, asset.name);
          setFileCategory(category);

          // Set default format based on category
          const defaultFormat = getDefaultFormatForCategory(category);
          setSelectedFormat(defaultFormat);

          setConvertedUri(null);
        }
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  // Build the FFmpeg command based on the selected format
  const buildFFmpegCommand = (input: string, output: string, format: string): string => {
    const fmt = format.toLowerCase();

    switch (fmt) {
      // Video conversion
      case "mp4":
        return `-y -i "${input}" -c:v libx264 -c:a aac -preset fast -crf 23 "${output}"`;

      case "mov":
        return `-y -i "${input}" -c:v libx264 -c:a aac -preset fast "${output}"`;

      case "avi":
        return `-y -i "${input}" -c:v mpeg4 -c:a mp3 -preset fast "${output}"`;

      // Audio extraction / conversion
      case "mp3":
        return `-y -i "${input}" -map a -q:a 0 "${output}"`;

      case "wav":
        return `-y -i "${input}" -map a -ac 2 -ar 44100 -acodec pcm_s16le "${output}"`;

      case "aac":
        return `-y -i "${input}" -map a -c:a aac -b:a 192k "${output}"`;

      // Image conversion
      case "jpg":
        return `-y -i "${input}" -c:v mjpeg -q:v 2 "${output}"`;

      case "png":
        return `-y -i "${input}" -c:v png "${output}"`;

      case "webp":
        return `-y -i "${input}" -c:v libwebp -qscale:v 75 "${output}"`;

      default:
        // Fallback to MP4
        return `-y -i "${input}" -c:v libx264 -c:a aac -preset fast -crf 23 "${output}"`;
    }
  };

  // Get the output directory - always use Expo's cache directory
  const getCacheDir = (): string => {
    // Preferred: use Paths.cache from the new Expo SDK 57 API
    try {
      const cachePath = Paths.cache.uri;
      if (cachePath && cachePath.length > 0) {
        // Ensure trailing slash
        return cachePath.endsWith("/") ? cachePath : cachePath + "/";
      }
    } catch (error) {
      console.warn("Paths.cache.uri not available:", error);
    }

    // Fallback: try the legacy cacheDirectory property
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const legacyDir = (FileSystemLegacy as any).cacheDirectory;
      if (legacyDir && typeof legacyDir === "string" && legacyDir.length > 0) {
        return legacyDir.endsWith("/") ? legacyDir : legacyDir + "/";
      }
    } catch (error) {
      console.warn("Legacy cacheDirectory not available:", error);
    }

    // Last resort - throw explicit error rather than using unwritable /tmp
    throw new Error("FileSystem cache directory is not available. Cannot determine output directory.");
  };

  // Get the MIME type for the selected format
  const getMimeTypeForFormat = (format: string): string => {
    const formatOption = ALL_FORMATS.find((f) => f.value === format);
    return formatOption?.mimeType || "application/octet-stream";
  };

  // Get the group for the selected format
  const getGroupForFormat = (format: string): "video" | "audio" | "image" | "unknown" => {
    const formatOption = ALL_FORMATS.find((f) => f.value === format);
    if (!formatOption) return "unknown";
    const group: "video" | "audio" | "image" | "unknown" = formatOption.group as "video" | "audio" | "image" | "unknown";
    return group;
  };

  // Get UTI for sharing based on format group
  const getUTIForFormat = (format: string): string => {
    const group = getGroupForFormat(format);
    switch (group) {
      case "video":
        return "public.movie";
      case "audio":
        return "public.audio";
      case "image":
        return "public.image";
      default:
        return "public.data";
    }
  };

  // Compile time constants (for lookup)
  const VALID_FORMATS = getValidFormatsForCategory(fileCategory);

  const convertFile = async () => {
    if (!selectedFile || !fileCategory) return;

    setIsConverting(true);
    setConvertedUri(null);

    try {
      const formatOption = ALL_FORMATS.find((f) => f.value === selectedFormat);
      if (!formatOption) {
        throw new Error("Invalid format selected");
      }

      const outputFileName = `converted_${Date.now()}.${formatOption.value}`;
      const cacheDir = getCacheDir();
      const outputUri = `${cacheDir}${outputFileName}`;

      const command = buildFFmpegCommand(selectedFile, outputUri, selectedFormat);

      // Execute FFmpeg
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();

      // Use ReturnCode.isSuccess() as required - static method on ReturnCode class
      if (ReturnCode.isSuccess(returnCode)) {
        setConvertedUri(outputUri);
        Alert.alert("Success", "File converted successfully!");

        // After conversion, share the file
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(outputUri, {
            mimeType: getMimeTypeForFormat(selectedFormat),
            dialogTitle: "Share your converted file",
            UTI: getUTIForFormat(selectedFormat),
          });
        } else {
          Alert.alert("Sharing Unavailable", "Cannot share the file on this device");
        }
      } else {
        // getFailStackTrace() returns null when there's no stack trace - get log output instead
        const errorStack = await session.getFailStackTrace();
        const logs = await session.getAllLogsAsString();
        throw new Error(`FFmpeg conversion failed (return code: ${returnCode.getValue()}).\nLogs: ${logs || errorStack || "No additional info"}`);
      }
    } catch (error) {
      console.error("Conversion error:", error);
      Alert.alert(
        "Conversion Failed",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsConverting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setFileName("");
    setFileMimeType(undefined);
    setFileCategory(null);
    setConvertedUri(null);
    setSelectedFormat("mp4"); // Reset to default
  };

  // Render format selector chips based on valid formats for the current category using FormatChip
  const renderFormatSelector = () => {
    if (!fileCategory) {
      // No file selected yet - show all formats as a placeholder
      const formats = ALL_FORMATS;
      return (
        <View style={styles.formatSelectorContainer}>
          <Text style={[
            styles.formatSelectorLabel,
            { color: theme.colors.textSecondary, fontFamily: theme.fontFamily },
          ]}>
            Select Output Format:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {formats.map((option) => {
              const isSelected = selectedFormat === option.value;
              return (
                <FormatChip
                  key={option.value}
                  label={option.label}
                  value={option.value as any}
                  selected={isSelected}
                  onPress={() => setSelectedFormat(option.value)}
                  disabled={isConverting}
                  accessibilityHint={`Convert to ${option.label}`}
                />
              );
            })}
          </ScrollView>
        </View>
      );
    }

    // File selected - show only valid formats for this category
    const formats = getValidFormatsForCategory(fileCategory);
    const categoryLabel =
      fileCategory === "video"
        ? "Video/Audio"
        : fileCategory === "audio"
        ? "Audio"
        : "Image";

    return (
      <View style={styles.formatSelectorContainer}>
        <Text style={[
          styles.formatSelectorLabel,
          { color: theme.colors.textSecondary, fontFamily: theme.fontFamily },
        ]}>
          Convert to ({categoryLabel}):
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {formats.map((option) => {
            const isSelected = selectedFormat === option.value;
            return (
              <FormatChip
                key={option.value}
                label={option.label}
                value={option.value as any}
                selected={isSelected}
                onPress={() => setSelectedFormat(option.value)}
                disabled={isConverting}
                accessibilityHint={`Convert to ${option.label}`}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.textPrimary, fontFamily: theme.fontFamily },
          ]}
          accessibilityRole="header"
        >
          Local File Converter
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.textSecondary, fontFamily: theme.fontFamily },
          ]}
        >
          Convert files between formats on-device
        </Text>

        {/* Step 1: Select File */}
        {!selectedFile && (
          <AppButton
            label="Select File"
            variant="primary"
            onPress={pickFile}
            disabled={isConverting}
            loading={isConverting}
            accessibilityHint="Pick a video, audio, or image file to convert"
          />
        )}

        {/* Step 2: File selected - show file name, format selector, and convert button */}
        {selectedFile && !isConverting && !convertedUri && (
          <View style={styles.fileInfo}>
            <Text
              style={[
                styles.fileName,
                { color: theme.colors.textSecondary, fontFamily: theme.fontFamily },
              ]}
              accessibilityLabel={`Selected file: ${fileName}`}
            >
              Selected: {fileName}
            </Text>
            {fileCategory && (
              <Text
                style={[
                  styles.fileCategoryBadge,
                  {
                    color: theme.colors.textSecondary,
                    backgroundColor: theme.colors.surfaceElevated,
                    fontFamily: theme.fontFamily,
                  },
                ]}
                accessibilityLabel={fileCategory}
              >
                {fileCategory === "video" ? "📹 Video" : fileCategory === "audio" ? "🎵 Audio" : "🖼️ Image"}
              </Text>
            )}

            {/* Format selector */}
            {renderFormatSelector()}

            <View style={styles.buttonRow}>
              <AppButton
                label={`Convert to ${selectedFormat.toUpperCase()}`}
                variant="primary"
                onPress={convertFile}
                disabled={isConverting}
                accessibilityHint="Convert the selected file to the chosen format and share it"
              />
              <AppButton
                label="Clear"
                variant="destructive"
                onPress={clearSelection}
                disabled={isConverting}
                accessibilityHint="Clear the current file selection"
              />
            </View>
          </View>
        )}

        {/* Step 3: Converting - show loading state */}
        {isConverting && (
          <View
            style={styles.converting}
            accessibilityRole="alert"
            accessibilityLabel={`Converting to ${selectedFormat.toUpperCase()}`}
          >
            <Text
              style={[
                styles.loadingText,
                { color: theme.colors.textSecondary, fontFamily: theme.fontFamily },
              ]}
            >
              Converting to {selectedFormat.toUpperCase()}...
            </Text>
          </View>
        )}

        {/* Step 4: Success - show converted file info */}
        {convertedUri && (
          <View
            style={[
              styles.success,
              {
                backgroundColor: theme.colors.surfaceElevated,
                shadowColor: theme.colors.overlay,
              },
            ]}
            accessibilityRole="alert"
            accessibilityLabel="Conversion complete"
          >
            <Text
              style={[
                styles.successText,
                { color: theme.colors.success, fontFamily: theme.fontFamily },
              ]}
            >
              Conversion Complete!
            </Text>
            <Text
              style={[
                styles.uriText,
                { color: theme.colors.textSecondary, fontFamily: theme.fontFamily },
              ]}
              accessibilityLabel={`Converted file: ${convertedUri.split("/").pop()}`}
            >
              {convertedUri.split("/").pop()}
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.displayLarge.fontSize,
    fontWeight: typography.displayLarge.fontWeight,
    lineHeight: typography.displayLarge.lineHeight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  fileInfo: {
    alignItems: "center",
    width: "100%",
  },
  fileName: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  fileCategoryBadge: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  // Format selector styles
  formatSelectorContainer: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  formatSelectorLabel: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
    marginBottom: spacing.sm,
    textAlign: "left",
  },
  chipRow: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  buttonRow: {
    flexDirection: "column",
    gap: spacing.sm,
    minWidth: 200,
    marginTop: spacing.xs,
  },
  converting: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  success: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: elevation.sm,
  },
  successText: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    lineHeight: typography.subtitle.lineHeight,
    marginBottom: spacing.xs,
  },
  uriText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
});