import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#F9FAFB" },
          headerTintColor: "#1F2937",
          headerTitleStyle: { color: "#1F2937" },
          contentStyle: { backgroundColor: "#F9FAFB" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "File Converter" }} />
        <Stack.Screen name="convert" options={{ title: "Convert", presentation: "modal" }} />
      </Stack>
    </>
  );
}