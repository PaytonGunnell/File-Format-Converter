import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { FFmpegKit, ReturnCode } from "@sheehanmunim/react-native-ffmpeg";

export default function Page() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUri, setConvertedUri] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: "*/*",
        copyToCacheDirectory: true,
      });
      
      // FIX: Modern Expo uses result.canceled and result.assets
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0].uri);
        setFileName(result.assets[0].name);
        setConvertedUri(null);
      }
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const convertFile = async () => {
    if (!selectedFile) return;
    
    setIsConverting(true);
    setConvertedUri(null);
    
    try {
      // Generate output filename
      const outputFileName = `converted_${Date.now()}.mp4`;
      const outputUri = `${FileSystem.cacheDirectory}${outputFileName}`;
      
      // Build FFmpeg command to convert to MP4
      // Using libx264 codec for H.264 video encoding
      const command = `-y -i "${selectedFile}" -c:v libx264 -preset fast -crf 23 "${outputUri}"`;
      
      // Execute FFmpeg
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();
      
      if (ReturnCode.isSuccess(returnCode)) {        setConvertedUri(outputUri);
        Alert.alert("Success", "File converted successfully!");
        
        // After conversion, share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(outputUri, {
            mimeType: "video/mp4",
            dialogTitle: "Share your converted file",
            UTI: "public.video",
          });
        } else {
          Alert.alert("Sharing Unavailable", "Cannot share the file on this device");
        }
      } else {
        const errorStack = await FFmpegKit.getFFmpegSessionToString(session);
        throw new Error(`FFmpeg error: ${errorStack}`);
      }
    } catch (error) {
      console.error("Conversion error:", error);
      Alert.alert("Conversion Failed", error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsConverting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setFileName("");
    setConvertedUri(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Local File Converter</Text>
      <Text style={styles.subtitle}>Convert files between formats on-device</Text>

      {!selectedFile && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={pickFile}
          disabled={isConverting}
        >
          <Text style={styles.buttonText}>Select File</Text>
        </TouchableOpacity>
      )}

      {selectedFile && !isConverting && !convertedUri && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>Selected: {fileName}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.convertButton]} 
              onPress={convertFile}
              disabled={isConverting}
            >
              <Text style={styles.buttonText}>Convert to MP4</Text>
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

      {isConverting && (
        <View style={styles.converting}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Converting...</Text>
        </View>
      )}

      {convertedUri && (
        <View style={styles.success}>
          <Text style={styles.successText}>Conversion Complete!</Text>
          <Text style={styles.uriText}>{convertedUri?.split("/").pop()}</Text>
        </View>
      )}
    </View>
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
  },
  fileName: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "column",
    gap: 12,
    minWidth: 200,
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