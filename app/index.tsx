import { useState } from "react";
// @ts-nocheck - Expo FileSystem types differ between versions; runtime access is safe
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { FFmpegKit } from "@sheehanmunim/react-native-ffmpeg";
// Use legacy require for FileSystem to access cacheDirectory
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const FileSystem = require("expo-file-system");

// Format options with their extensions and MIME types
const FORMAT_OPTIONS: Array<{
  label: string;
  value: string;
  mimeType: string;
  group: "video" | "audio";
}> = [
  { label: "MP4", value: "mp4", mimeType: "video/mp4", group: "video" },
  { label: "MOV", value: "mov", mimeType: "video/quicktime", group: "video" },
  { label: "AVI", value: "avi", mimeType: "video/x-msvideo", group: "video" },
  { label: "MP3", value: "mp3", mimeType: "audio/mpeg", group: "audio" },
  { label: "WAV", value: "wav", mimeType: "audio/wav", group: "audio" },
];

export default function Page() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("mp4");
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertedUri, setConvertedUri] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      // Check if it's a successful result
      if (result && "canceled" in result && result.canceled === false) {
        // New DocumentPicker API: assets is an array of DocumentPickerAsset
        const assets = result.assets as Array<{ uri: string; name: string }>;
        if (assets && assets.length > 0) {
          setSelectedFile(assets[0].uri);
          setFileName(assets[0].name);
          setConvertedUri(null);
          setSelectedFormat("mp4");
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
      case "mp3":
        // Extract highest quality audio to MP3
        return `-y -i "${input}" -map a -q:a 0 "${output}"`;

      case "wav":
        // Extract audio to WAV (uncompressed, high quality)
        return `-y -i "${input}" -map a -ac 2 -ar 44100 -acodec pcm_s16le "${output}"`;

      case "mov":
        // Convert to MOV with H.264 video codec
        return `-y -i "${input}" -c:v libx264 -c:a aac -preset fast "${output}"`;

      case "avi":
        // Convert to AVI with MPEG-4 video codec (widely compatible)
        return `-y -i "${input}" -c:v mpeg4 -c:a mp3 -preset fast "${output}"`;

      case "mp4":
      default:
        // Convert to MP4 with H.264 video codec
        return `-y -i "${input}" -c:v libx264 -c:a aac -preset fast -crf 23 "${output}"`;
    }
  };

  // Get the output directory (FileSystem.cacheDirectory with fallback)
  const getCacheDir = (): string => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const dir: unknown = FileSystem.cacheDirectory;
      return (dir as string) || "/tmp/";
    } catch {
      return "/tmp/";
    }
  };

  const convertFile = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setConvertedUri(null);

    try {
      const formatOption = FORMAT_OPTIONS.find((f) => f.value === selectedFormat);
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

      if (returnCode.isValueSuccess()) {
        setConvertedUri(outputUri);
        Alert.alert("Success", "File converted successfully!");

        // After conversion, share the file
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(outputUri, {
            mimeType: formatOption.mimeType,
            dialogTitle: "Share your converted file",
            UTI: formatOption.group === "audio" ? "public.audio" : "public.video",
          });
        } else {
          Alert.alert("Sharing Unavailable", "Cannot share the file on this device");
        }
      } else {
        const errorStack = await session.getFailStackTrace();
        throw new Error(`FFmpeg error: ${errorStack}`);
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
    setConvertedUri(null);
    setSelectedFormat("mp4");
  };

  // Render format selector chips
  const renderFormatSelector = () => {
    return (
      <View style={styles.formatSelectorContainer}>
        <Text style={styles.formatSelectorLabel}>Select Output Format:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FORMAT_OPTIONS.map((option) => {
            const isSelected = selectedFormat === option.value;
            const isAudio = option.group === "audio";
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  isSelected && isAudio && styles.chipSelectedAudio,
                  isAudio && styles.chipAudio,
                ]}
                onPress={() => setSelectedFormat(option.value)}
                disabled={isConverting}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                    isAudio && styles.chipTextAudio,
                    isSelected && isAudio && styles.chipTextSelectedAudio,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Local File Converter</Text>
        <Text style={styles.subtitle}>Convert files between formats on-device</Text>

        {/* Step 1: Select File */}
        {!selectedFile && (
          <TouchableOpacity style={styles.button} onPress={pickFile} disabled={isConverting}>
            <Text style={styles.buttonText}>Select File</Text>
          </TouchableOpacity>
        )}

        {/* Step 2: File selected - show file name, format selector, and convert button */}
        {selectedFile && !isConverting && !convertedUri && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>Selected: {fileName}</Text>

            {/* Format selector */}
            {renderFormatSelector()}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.convertButton]}
                onPress={convertFile}
                disabled={isConverting}
              >
                <Text style={styles.buttonText}>Convert to {selectedFormat.toUpperCase()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={clearSelection}
                disabled={isConverting}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Converting - show loading state */}
        {isConverting && (
          <View style={styles.converting}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Converting to {selectedFormat.toUpperCase()}...</Text>
          </View>
        )}

        {/* Step 4: Success - show converted file info */}
        {convertedUri && (
          <View style={styles.success}>
            <Text style={styles.successText}>Conversion Complete!</Text>
            <Text style={styles.uriText}>{convertedUri.split("/").pop()}</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
  },
  fileInfo: {
    alignItems: "center",
    width: "100%",
  },
  fileName: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 24,
    textAlign: "center",
  },
  // Format selector styles
  formatSelectorContainer: {
    width: "100%",
    marginBottom: 24,
  },
  formatSelectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "left",
  },
  chipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  chipAudio: {
    backgroundColor: "#F0F9FF",
    borderColor: "#7DD3FC",
  },
  chipSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#2563EB",
  },
  chipSelectedAudio: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0284C7",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  chipTextAudio: {
    color: "#0C4A6D",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  chipTextSelectedAudio: {
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "column",
    gap: 12,
    minWidth: 200,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  convertButton: {
    backgroundColor: "#10B981",
  },
  clearButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  converting: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  success: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 16,
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 8,
  },
  uriText: {
    fontSize: 14,
    color: "#047857",
  },
});
