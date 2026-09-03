import { FormatValue } from '../components/FormatChip';

// Maps each supported format to its media category.
export type MediaCategory = 'video' | 'audio';

export const FORMAT_MEDIA_TYPE: Record<FormatValue, MediaCategory> = {
  mp4: 'video',
  mov: 'video',
  avi: 'video',
  mp3: 'audio',
  wav: 'audio',
};

// Returns the media category for a given format value.
export const getFormatMediaType = (format: FormatValue): MediaCategory => {
  return FORMAT_MEDIA_TYPE[format];
};

// Returns the list of format values that are compatible with the given
// source media category. For example, an audio source can only target
// audio containers (mp3, wav), while a video source can target both
// video containers (mp4, mov, avi) and audio containers (mp3, wav).
export const getCompatibleFormats = (
  sourceCategory: MediaCategory | null
): FormatValue[] => {
  if (sourceCategory === null) {
    // Unknown source type — allow all formats.
    return ['mp4', 'mov', 'avi', 'mp3', 'wav'];
  }

  if (sourceCategory === 'audio') {
    // Audio-only sources: only audio targets are valid.
    return ['mp3', 'wav'];
  }

  if (sourceCategory === 'video') {
    // Video sources: video containers and audio extraction are both valid.
    return ['mp4', 'mov', 'avi', 'mp3', 'wav'];
  }

  return ['mp4', 'mov', 'avi', 'mp3', 'wav'];
};

// Determines whether a target format is compatible with a source media category.
export const isFormatCompatible = (
  targetFormat: FormatValue,
  sourceCategory: MediaCategory | null
): boolean => {
  if (sourceCategory === null) return true;

  if (sourceCategory === 'audio') {
    // Audio sources cannot target video-only containers.
    return getFormatMediaType(targetFormat) === 'audio';
  }

  // Video sources can target both video and audio containers.
  return true;
};
