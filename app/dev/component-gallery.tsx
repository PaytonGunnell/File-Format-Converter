import React from 'react';
import { ScrollView, Text, View, StyleSheet, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from '../../theme/ThemeProvider';
import { ThemeProvider as ThemeProviderExport, useTheme as useThemeExport } from '../../theme';
import {
  AppButton,
  FormatChip,
  Card,
  ProgressRing,
  ProgressBar,
  spacing,
  radii,
} from '../../theme';

// Debug-only screen for checking every primitive visually.
// Only accessible in devBuilds - remove before production.
function ComponentGalleryScreen() {
  return (
    <ThemeProviderExport>
      <ComponentGalleryContent />
    </ThemeProviderExport>
  );
}

function ComponentGalleryContent() {
  const theme = useThemeExport();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={theme.colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Component Gallery
        </Text>

        {/* AppButton Examples */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          AppButton
        </Text>
        <View style={styles.row}>
          <AppButton label="Primary" variant="primary" />
          <AppButton label="Secondary" variant="secondary" />
        </View>
        <View style={styles.row}>
          <AppButton label="Ghost" variant="ghost" />
          <AppButton label="Destructive" variant="destructive" />
        </View>
        <View style={styles.row}>
          <AppButton label="Loading" loading />
          <AppButton label="Disabled" disabled />
        </View>

        {/* FormatChip Examples */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          FormatChip
        </Text>
        <View style={styles.chipRow}>
          <FormatChip label="MP4" value="mp4" />
          <FormatChip label="MOV" value="mov" selected />
          <FormatChip label="AVI" value="avi" disabled />
        </View>
        <View style={styles.chipRow}>
          <FormatChip label="MP3" value="mp3" />
          <FormatChip label="WAV" value="wav" selected />
          <FormatChip label="AIFF" value="mp3" disabled />
        </View>

        {/* Card Examples */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Card
        </Text>
        <Card title="File: example.mp4">
          <Text style={{ color: theme.colors.textSecondary }}>Sample card content</Text>
        </Card>

        {/* Progress Indicators */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Progress Indicators
        </Text>
        <View style={styles.progressRow}>
          <ProgressRing progress={0.75} accessibilityLabel="75% complete" />
          <Text style={{ color: theme.colors.textSecondary }}>75%</Text>
        </View>
        <View style={styles.progressRow}>
          <ProgressBar progress={0.3} accessibilityLabel="30% complete" />
          <Text style={{ color: theme.colors.textSecondary }}>30%</Text>
        </View>

        {/* Spacing Grid */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Spacing Grid
        </Text>
        <View style={styles.spacingGrid}>
          <View style={[styles.spacingBox, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.spacingBox, { backgroundColor: theme.colors.primary }]} />
        </View>

        {/* Color Tokens */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Color Tokens
        </Text>
        <View style={styles.colorRow}>
          <ColorSwatch name="background" value={theme.colors.background} />
          <ColorSwatch name="surface" value={theme.colors.surface} />
          <ColorSwatch name="primary" value={theme.colors.primary} />
        </View>
        <View style={styles.colorRow}>
          <ColorSwatch name="success" value={theme.colors.success} />
          <ColorSwatch name="warning" value={theme.colors.warning} />
          <ColorSwatch name="error" value={theme.colors.error} />
        </View>
      </ScrollView>
    </View>
  );
}

function ColorSwatch({ name, value }: { name: string; value: string }) {
  const theme = useThemeExport();
  return (
    <View style={styles.colorSwatchContainer}>
      <View
        style={{
          width: 40,
          height: 40,
          backgroundColor: value,
          borderRadius: radii.sm,
        }}
      />
      <Text
        style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: spacing.xs }}
        accessibilityLabel={`Color: ${name}`}
      >
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spacingGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  spacingBox: {
    width: spacing.md,
    height: spacing.md,
    borderRadius: radii.sm,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorSwatchContainer: {
    alignItems: 'center',
  },
});

export default ComponentGalleryScreen;