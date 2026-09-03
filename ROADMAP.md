# File Format Converter: UX/UI Roadmap

**Owner:** Payton · **Status:** In Progress · **Last updated:** September 2, 2026

**Stack:** React Native, Expo, `expo-file-system`, `expo-sharing`, `ffmpeg-kit-react-native` (community fork)

## Vision

The conversion engine already works. File selection, format selection, local FFmpeg execution, and the native share sheet are all live. This roadmap is not about the engine. It's about everything wrapped around it: the difference between an app that converts files and an app that feels like a premium tool people trust with their files.

### Guiding Principles

- The user should never wonder whether the app has frozen.
- The user should never see a raw error, log line, or stack trace.
- The user should never lose or orphan a file, or watch storage balloon silently.
- Every state change animates. Nothing hard-cuts.
- Every meaningful action gets haptic confirmation.
- Every screen works equally well in light mode, dark mode, and with a screen reader.

### How to Use This Roadmap

Six phases, in build order. Phase 1 comes first because every later phase depends on the design tokens and primitives it sets up. Complete a phase's checklist and manually verify it on a physical device before starting the next one. A checked box means implemented and confirmed working, not just code written. Each phase ends with an Exit Criteria checklist. Treat that as a gate before moving on.

## Table of Contents

1. [Phase 1: Design System and UI Foundation](#phase-1-design-system-and-ui-foundation)
2. [Phase 2: Real-Time State and Feedback](#phase-2-real-time-state-and-feedback)
3. [Phase 3: Advanced Media Handling](#phase-3-advanced-media-handling)
4. [Phase 4: Intelligent File and Storage Management](#phase-4-intelligent-file-and-storage-management)
5. [Phase 5: Error Handling and Resilience](#phase-5-error-handling-and-resilience)
6. [Phase 6: Final Polish and Deployment](#phase-6-final-polish-and-deployment)
7. [Definition of Done](#definition-of-done)

---

## Phase 1: Design System and UI Foundation

Build this phase before anything else. Every chip, sheet, button, and progress indicator introduced later reuses what gets defined here. Building the same component twice, in two different phases, is how apps end up feeling inconsistent.

### 1.0 Dependency Installation

- [ ] Install `react-native-reanimated`. Add `react-native-reanimated/plugin` to `babel.config.js` as the last plugin in the list.
- [ ] Install `react-native-gesture-handler`. Wrap the app root in `<GestureHandlerRootView style={{ flex: 1 }}>`.
- [ ] Install `@gorhom/bottom-sheet`.
- [ ] Install `react-native-svg` for the progress ring and bar primitives.
- [ ] Install `react-native-safe-area-context`.
- [ ] Rebuild the custom Expo Dev Client after installing the packages above. `ffmpeg-kit-react-native` already requires a dev client instead of Expo Go, so this doesn't change the build workflow, but each new native module still needs a fresh native build before it will show up.

### 1.1 Design Tokens

- [ ] Create `theme/colors.ts` with a semantic palette: `background`, `surface`, `surfaceElevated`, `primary`, `primaryMuted`, `success`, `warning`, `error`, `textPrimary`, `textSecondary`, `border`, `overlay`.
- [ ] Define a light value and a dark value for every token above. No raw hex code should appear anywhere else in the app.
- [ ] Create `theme/typography.ts` with a fixed type scale: `displayLarge`, `title`, `subtitle`, `body`, `caption`, `label`, each with a defined size and line height.
- [ ] Standardize on one font family across the app, either the system default or a variable font loaded through `expo-font`.
- [ ] Create `theme/spacing.ts` on an 8pt grid: `xs=4, sm=8, md=16, lg=24, xl=32, xxl=48`.
- [ ] Create `theme/radii.ts`: `sm=8, md=12, lg=20, pill=999`.
- [ ] Build a `ThemeProvider` that resolves tokens from `useColorScheme()` and exposes them through a `useTheme()` hook.
- [ ] Add a manual theme override (System, Light, or Dark), persisted locally, and wire it into Settings during Phase 6.

### 1.2 Core Primitive Components

- [ ] Build `<AppButton />` with `primary`, `secondary`, `ghost`, and `destructive` variants, plus a `loading` prop that swaps the label for an inline spinner without changing the button's size.
- [ ] Build `<FormatChip />` for MP4, MOV, AVI, MP3, and WAV, with `default`, `selected`, and `disabled` visual states.
- [ ] Wire `<FormatChip />`'s `disabled` state to the selected source file's media type. Audio-only sources like MP3 and WAV shouldn't offer video-container targets like MP4, MOV, and AVI, and vice versa.
- [ ] Build a reusable `<AppBottomSheet />` wrapper preconfigured with the app's corner radius, backdrop opacity, and snap points, so every future sheet inherits the same motion and styling.
- [ ] Build `<Card />` for file rows and queue items, with consistent padding, an elevation token, and a pressed-state opacity change.
- [ ] Build `<ProgressRing />` and `<ProgressBar />`, both SVG-based, accepting an animated `progress` value from 0 to 1.
- [ ] Build a lightweight `<Toast />` or snackbar for brief, non-blocking confirmations like "Cache cleared."
- [ ] Add a debug-only `/dev/component-gallery` screen for checking every primitive visually, in isolation, in both themes.

### 1.3 Navigation and Layout Shell

- [ ] Confirm the app's screen structure covers Home/Picker, Active Conversion, Queue, and Settings.
- [ ] Apply `react-native-safe-area-context` consistently so no control sits under a notch, Dynamic Island, or gesture bar on any screen.
- [ ] Replace default abrupt screen transitions with intentional ones: slide-from-right for stack pushes, slide-from-bottom for modals and sheets.

### 1.4 Dark Mode and Accessibility Baseline

- [ ] Check every color token pairing against WCAG AA contrast, 4.5:1 for body text, in both palettes.
- [ ] Add `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` to every primitive built in 1.2.
- [ ] Confirm the app stays usable with OS font scaling up to 130%. No clipped text, no broken layouts.
- [ ] Confirm every touchable component meets the 44x44pt minimum hit target.

**Exit Criteria**
- [ ] Every screen pulls color, type, and spacing only from the Phase 1 token files. No hardcoded values remain.
- [ ] All primitives render correctly, with correct contrast, in both light and dark mode.
- [ ] `<FormatChip />`, `<AppButton />`, and `<AppBottomSheet />` pass a manual VoiceOver and TalkBack check.

---

## Phase 2: Real-Time State and Feedback

> The API names below follow the standard FFmpegKit surface: `executeAsync`, `Statistics`, `ReturnCode`, `FFprobeKit`. Community forks generally keep this surface for drop-in compatibility, but confirm exact method signatures against your fork's own docs before wiring this up.

This is the phase where the app stops feeling like a background script. It starts feeling like software that's actually talking to the user.

### 2.1 FFmpeg Statistics to Progress Pipeline

- [ ] Before starting a conversion, call `FFprobeKit.getMediaInformation(inputUri)` and extract the total duration. Store it as `totalDurationMs`.
- [ ] Replace any blocking `FFmpegKit.execute()` call with `FFmpegKit.executeAsync(command, onComplete, onLog, onStatistics)`, so native execution never ties up the JS thread.
- [ ] In the statistics callback, read the elapsed encoded time and compute `progress = clamp(elapsedMs / totalDurationMs, 0, 1)`.
- [ ] Throttle progress-state updates to roughly 10 per second. The native callback can fire far more often than the UI needs to repaint.
- [ ] Drive `<ProgressBar />` and `<ProgressRing />` off a Reanimated shared value (`useSharedValue`), not raw React state, so the fill animates on the UI thread and never drops frames while the JS thread is busy.
- [ ] Handle the case where duration is 0 or unavailable, such as a corrupt input or some raw audio formats, by falling back to an indeterminate or marquee progress style instead of a bar stuck at 0%.
- [ ] Surface bytes written and current bitrate from the statistics callback in an optional details row for power users.
- [ ] Parse `onLog` output only for keyword-matched warnings, like stream-mapping issues, and show those as a small non-blocking inline notice. Never render raw log lines in the UI.

### 2.2 Keeping the UI Thread Free

- [ ] Audit every progress update to confirm it runs through a Reanimated worklet, not `setState` on every native callback tick.
- [ ] Wrap non-urgent post-conversion JS work, like writing to the cache manifest or local logging, in `InteractionManager.runAfterInteractions()`, so it doesn't compete with the completion animation.
- [ ] Enable `expo-keep-awake` for the duration of an active conversion so the screen doesn't lock mid-encode.
- [ ] On Android, add a foreground-service notification for conversions expected to run longer than about 15 seconds, using a custom Expo config plugin since this isn't exposed by the core Expo SDK. Android can throttle or kill CPU-intensive background work once the app is backgrounded.
- [ ] On iOS, register a background task, such as `expo-background-task` or `expo-task-manager` depending on your SDK version, to request extra execution time if the user backgrounds the app mid-conversion. Clearly communicate the OS time limit if a job can't finish in time.
- [ ] Stress-test with a large file, 500MB or more, and confirm scrolling, tapping Cancel, and navigating away all stay responsive, under about 100ms of input latency, while encoding is active.

### 2.3 Conversion Screen States

- [ ] Design and build distinct states: `idle`, `preparing` (probing and validating), `converting` (progress active), `finishing` (past 95%, writing the final container), `success`, `error`, and `cancelled`.
- [ ] Animate transitions between these states, using a crossfade plus a slight scale via Reanimated layout transitions, instead of hard-swapping components.
- [ ] On success, animate the progress indicator completing to 100% and morphing into a checkmark, instead of abruptly swapping it out.
- [ ] Add a Cancel affordance visible through `preparing` and `converting`, wired to the session's cancel call, with its own micro-state: `cancelling…` then `cancelled`.

### 2.4 Haptic Feedback Map

- [ ] Install and configure `expo-haptics`.
- [ ] Fire a selection haptic on every format chip change.
- [ ] Fire a light impact haptic on primary button presses, like Start Conversion and Add to Queue.
- [ ] Fire a success notification haptic exactly once when a conversion completes.
- [ ] Fire an error notification haptic exactly once when a conversion fails.
- [ ] Fire a warning notification haptic for non-fatal issues, like a low-storage warning or partial metadata loss.
- [ ] Guard against duplicate haptic firing from re-renders, and respect the OS-level reduce-motion and accessibility settings.

**Exit Criteria**
- [ ] Converting a large file shows smooth, continuously updating progress with no visible stutter.
- [ ] The app stays fully interactive, including scroll, cancel, and navigate, throughout a long conversion.
- [ ] Every success and every failure produces exactly one haptic pulse, every time.

---

## Phase 3: Advanced Media Handling

### 3.1 Metadata Preservation

- [ ] Add a "Preserve original metadata" toggle to the conversion options sheet, defaulted on.
- [ ] When enabled, append `-map_metadata 0` to the generated FFmpeg command, plus `-map_metadata 0:g` where a global tag block exists.
- [ ] Document which fields survive which conversion path. For example, MOV to MP4 preserves creation date reliably, while MOV to AVI drops most tags. Surface a short helper line under the toggle.
- [ ] For video conversions, explicitly preserve `creation_time` so output files sort correctly by date in downstream media servers like Plex, Jellyfin, or Emby.
- [ ] For audio conversions, preserve title, artist, album, track number, and cover-art tags, adding `-id3v2_version 3` when targeting MP3.
- [ ] Handle target containers that can't carry a given source tag by dropping it silently and noting that once on the result screen. Never fail the whole conversion over one unsupported tag.
- [ ] Add a test that converts a sample file with known metadata and verifies, through `ffprobe`, that the output keeps it.

### 3.2 File Size Comparison

- [ ] Before conversion, read the source file's size through `expo-file-system` and store it as `originalSizeBytes`.
- [ ] After conversion, read the output file's size the same way and store it as `convertedSizeBytes`.
- [ ] Build a shared `formatBytes()` utility that converts bytes to KB, MB, or GB with one decimal place, and use it everywhere a size is shown.
- [ ] Design a result card showing both sizes side by side with a percentage delta, for example "12.4 MB to 8.1 MB, 35% smaller." Color it green for a reduction and neutral or amber for growth.
- [ ] Add a small proportional two-bar visual next to the numbers for an at-a-glance comparison.
- [ ] Persist size comparisons per file so they're still visible from the Queue or History screen afterward, not just in the moment of completion.

### 3.3 Batch Queue System

- [ ] Install a lightweight state management library, Zustand recommended, if the project doesn't already have one for cross-screen state.
- [ ] Model each queue item as `{ id, sourceUri, sourceName, targetFormat, status, progress, sessionId, originalSizeBytes, convertedSizeBytes, error }`.
- [ ] Implement queue actions: `addToQueue`, `removeFromQueue`, `reorderQueue`, `startQueue`, `cancelItem`, `retryItem`, `clearCompleted`.
- [ ] Add multi-select to the file picker so several files can be added to the queue in one pass, either with one shared target format or per-file formats.
- [ ] Process the queue sequentially, not in parallel. Document this decision in code comments. Concurrent on-device FFmpeg sessions risk CPU and thermal issues on mobile hardware.
- [ ] Build the Queue screen as a scrollable list of `<Card />` rows, each showing filename, a target-format chip, and a compact inline progress indicator.
- [ ] Support drag-to-reorder on not-yet-started items, using Reanimated with Gesture Handler's draggable-list pattern.
- [ ] Support swipe-to-remove on queued items, with an undo snackbar.
- [ ] Show a persistent, live-updating queue summary header, for example "3 of 7 complete, 2 remaining."
- [ ] If one item fails, keep processing the rest of the queue automatically instead of halting the whole batch. Surface a per-item retry afterward.
- [ ] Add a queue-level "Cancel All," behind a confirmation, that stops the current session and clears remaining not-yet-started items.
- [ ] Persist queue state to disk on backgrounding, so the app can accurately reflect partial progress, or resume, if the process is later killed and relaunched.

**Exit Criteria**
- [ ] A file converted with metadata preservation on keeps its creation date and title tags when checked afterward.
- [ ] The before-and-after size comparison shows correctly for both size-reducing and size-increasing conversions.
- [ ] A queue of five or more mixed-format files processes sequentially end to end, survives one item failing, and can be reordered before it starts.

---

## Phase 4: Intelligent File and Storage Management

### 4.1 Cache Lifecycle and Manifest

- [ ] Write all converted output files to the Expo cache directory, never the documents directory. Cache is explicitly reclaimable by the OS and is the semantically correct place for regenerable converted files.
- [ ] Maintain a lightweight JSON manifest, `cacheDirectory/manifest.json`, recording `{ uri, createdAt, sizeBytes, sourceName }` for every converted file, so cleanup logic never has to recursively scan the whole directory.
- [ ] Update the manifest transactionally on every write and delete, so it can't drift from what's actually on disk.
- [ ] Add a Settings to Storage screen showing total cache size, summed from the manifest, with a manual "Clear Cache" action behind a confirmation dialog.

### 4.2 Automatic Cleanup

- [ ] On every cold start, delete manifest entries older than a configurable threshold, defaulted to 7 days.
- [ ] Enforce a maximum total cache size, defaulted to 500MB. If it's exceeded, delete the oldest entries first until back under budget, regardless of age.
- [ ] Run cleanup after `InteractionManager.runAfterInteractions()`, so app launch is never delayed by disk I/O.
- [ ] After a file is shared through `expo-sharing`, mark it `sharedAt` in the manifest. Shared files become eligible for more aggressive cleanup, for example 24 hours, since the user already has their exported copy.
- [ ] Never delete a file that's referenced by an in-progress or queued job.
- [ ] Log what automatic cleanup deletes in dev builds only, so the policy stays auditable while it's being tuned.

### 4.3 Low-Storage Handling

- [ ] Before starting any job, check free device storage and compare it against an estimated output size: input size times a per-format multiplier, tuned empirically per conversion pair.
- [ ] Require free space to be at least the estimated output size times 1.5, as a safety buffer, before allowing a job to start.
- [ ] If space is insufficient, block the start action with a specific, friendly alert instead of letting FFmpeg fail mid-encode. For example: "This conversion needs about 340 MB, but only 210 MB is free."
- [ ] Give that alert a one-tap "Free up space" action that jumps straight to the Storage screen.
- [ ] Detect the specific "no space left on device" FFmpeg failure signature mid-conversion, and map it to the same friendly message, in case space got consumed by something else during encoding.
- [ ] On any mid-conversion failure, immediately delete the partial output file, so failed attempts don't consume the storage they were trying to protect.

**Exit Criteria**
- [ ] Leaving the app installed and idle for a week doesn't grow its cache past the configured cap.
- [ ] Starting a conversion on a device with deliberately limited free space shows the friendly pre-flight warning instead of a failure mid-encode.
- [ ] Force-quitting mid-conversion and relaunching leaves no orphaned partial files behind.

---

## Phase 5: Error Handling and Resilience

### 5.1 FFmpeg Error Translation Layer

- [ ] On every session completion, explicitly check for success, cancellation, or failure. Never assume a non-throw means success.
- [ ] Buffer the last roughly 200 lines of `onLog` output per session in memory for diagnostics, without ever rendering it raw to the user.
- [ ] Build a `translateFFmpegError(logBuffer, returnCode)` utility that matches known failure signatures against a maintained dictionary. Map a no-space error to a storage message with a fix-it action. Map corrupt input to "This file looks corrupted or isn't a format we can read." Map a permission error to "The app couldn't access this file, try selecting it again." Map a missing codec or muxer to "This conversion isn't supported on your device."
- [ ] For any signature not in the dictionary, fall back to one generic message, "Something went wrong converting this file," plus a "View technical details" disclosure that expands the buffered log excerpt for advanced users, without ever making it the primary message.
- [ ] Route every unmatched error into local dev-mode logging, and remote crash reporting later if that gets added, so the dictionary can grow from real failures over time.
- [ ] Keep the translation and pattern-matching step synchronous, running only over the small buffered string, never over full unbounded log output, so it can't block the UI thread.

### 5.2 JS-Side Resilience

- [ ] Wrap the app's top-level navigator in a React error boundary that shows a friendly "Something went wrong, restart the app" screen instead of a blank screen or a red-box crash.
- [ ] Wrap the conversion screen in its own nested error boundary, so a rendering bug in the progress UI can't take the whole app down mid-conversion.
- [ ] Validate file-picker results defensively (a missing URI, a zero-byte file, an unsupported MIME type) before constructing any FFmpeg command, with a specific friendly message for each rejection reason.
- [ ] Explicitly handle a source format matching the target format, like MP4 to MP4. Either short-circuit to a fast copy, or clearly explain why conversion isn't needed, instead of silently running a no-op command.

### 5.3 Edge Cases and Recovery

- [ ] On the next launch after a force-quit or crash mid-conversion, detect orphaned sessions and partial files through the cache manifest, and clean them up automatically.
- [ ] Detect the user revoking file-system or media-library permissions mid-session from OS settings, and prompt to re-grant instead of showing a generic failure.
- [ ] Note in code comments that conversion has no network dependency, so no error state should ever mention connectivity.
- [ ] Add a one-tap Retry action on every error state that re-runs the exact same job with the same input and options.
- [ ] Log a distinguishable internal code alongside every friendly message, like `ERR_NO_SPACE` or `ERR_CORRUPT_INPUT`, so a user's report can be mapped back to a specific failure class later.

**Exit Criteria**
- [ ] Feeding the app a deliberately corrupted file produces a friendly message, not a stack trace or a frozen screen.
- [ ] Killing free storage mid-test and starting a conversion produces the mapped low-storage message, not a raw FFmpeg failure.
- [ ] Every error state offers a working one-tap Retry.

---

## Phase 6: Final Polish and Deployment

### 6.1 Motion and Micro-Interactions

- [ ] Use spring-based, not linear, transitions for bottom-sheet open and close.
- [ ] Add a subtle press-scale, around 0.97, on every `<AppButton />` and `<Card />` tap.
- [ ] Stagger file-picker list items into view on load instead of rendering them all at once.
- [ ] Time the success-checkmark "pop" animation to land together with the success haptic.
- [ ] Use skeleton placeholders that match the final content shape for every loading state, like queue loading or cache size calculating. Never a bare spinner on an empty screen.
- [ ] Respect the OS "Reduce Motion" setting by swapping spring and slide animations for simple opacity crossfades when it's turned on.

### 6.2 Design System Consolidation

- [ ] Audit the whole app for hardcoded colors, font sizes, or spacing values, and migrate any stragglers into the Phase 1 token files.
- [ ] Confirm the bottom sheet is the single canonical surface for every secondary options panel: format details, batch settings, the metadata toggle, storage settings.
- [ ] Confirm the chip is the canonical control for every mutually exclusive small choice set: formats, theme selection, cleanup threshold.
- [ ] Design empty states, an illustration, a message, and a call to action, for the Queue and Storage screens when there's nothing to show, instead of a blank view.
- [ ] Write a one-page internal style guide, `docs/DESIGN_SYSTEM.md`, documenting tokens, primitives, and usage rules.
- [ ] Do a side-by-side visual pass of every screen in light and dark mode.

### 6.3 Accessibility and Localization Pass

- [ ] Do a full VoiceOver and TalkBack pass across every screen and state, confirming a logical focus order and no unlabeled controls.
- [ ] Externalize all user-facing strings, including the Phase 5 error dictionary, into a localization layer, even if only English ships at launch.
- [ ] Confirm the app is fully usable with a screen reader alone, start to finish: select a file, choose a format, start conversion, hear success.

### 6.4 Pre-Launch Deployment Checklist

- [ ] Configure EAS Build profiles for `development`, `preview`, and `production`.
- [ ] Verify `ffmpeg-kit-react-native` links correctly in a real production or release build, not just the dev client. This is a common source of "works in dev, fails in prod" bugs.
- [ ] Confirm required permission strings, for file access and the photo library, are present in the app config with clear, user-facing purpose text.
- [ ] Run a device-matrix smoke test on a low-end Android device and an older iPhone, specifically on the Phase 2 progress-bar and haptics work, since simulators don't reflect real thermal and CPU behavior.
- [ ] Prepare store screenshots that show the polished conversion-progress state and the batch queue, not just the file picker.
- [ ] Remove or hide all debug-only screens, like the component gallery and any perf overlays, behind a dev-only flag before submission.

**Exit Criteria**
- [ ] A production build, not the dev client, completes a full convert-and-share flow on both platforms without incident.
- [ ] Every string in the app comes from the localization layer, not a hardcoded literal.
- [ ] No debug-only UI is reachable in the production build.

---

## Definition of Done

The roadmap is complete when all of the following are true together, on a real device, not just when every box above is checked in isolation.

- [ ] A first-time user can convert a file without reading any instructions.
- [ ] No screen ever shows a raw stack trace, a native error code, or unformatted log text.
- [ ] Every action that takes longer than about a second gives visible feedback within 100ms.
- [ ] The app never appears to hang, even during a multi-minute conversion of a large file.
- [ ] Cache size never grows unbounded between sessions without the user being able to see or control it.
- [ ] Dark mode, VoiceOver and TalkBack, and Dynamic Type are fully supported end to end, not bolted onto one screen.
