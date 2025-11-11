/**
 * Audio Utilities
 * Helper functions for audio processing, format conversion, and streaming
 * Handles conversion between Web Audio API formats and Deepgram requirements
 */

/**
 * Convert Float32Array audio data to Int16Array
 * Required for Deepgram which expects Linear16 encoding
 * @param {Float32Array} buffer - Input audio buffer from Web Audio API
 * @returns {Int16Array} Converted audio data
 */
export function convertFloat32ToInt16(buffer) {
  if (!buffer || !(buffer instanceof Float32Array)) {
    throw new Error('Invalid input: expected Float32Array');
  }
  
  const int16Buffer = new Int16Array(buffer.length);
  
  for (let i = 0; i < buffer.length; i++) {
    // Clamp values to [-1, 1] range
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    
    // Convert to 16-bit integer
    // Multiply by 32767 for positive, 32768 for negative
    int16Buffer[i] = sample < 0 
      ? sample * 0x8000 
      : sample * 0x7FFF;
  }
  
  return int16Buffer;
}

/**
 * Convert Int16Array back to Float32Array
 * Useful for playing back recorded audio
 * @param {Int16Array} buffer - Input int16 buffer
 * @returns {Float32Array} Converted audio data
 */
export function convertInt16ToFloat32(buffer) {
  if (!buffer || !(buffer instanceof Int16Array)) {
    throw new Error('Invalid input: expected Int16Array');
  }
  
  const float32Buffer = new Float32Array(buffer.length);
  
  for (let i = 0; i < buffer.length; i++) {
    // Convert from 16-bit integer to float [-1, 1]
    float32Buffer[i] = buffer[i] < 0
      ? buffer[i] / 0x8000
      : buffer[i] / 0x7FFF;
  }
  
  return float32Buffer;
}

/**
 * Create an audio processor node for streaming
 * Sets up ScriptProcessorNode with optimal buffer size
 * @param {AudioContext} audioContext - Web Audio context
 * @param {MediaStream} stream - Media stream from getUserMedia
 * @param {Function} onProcess - Callback for audio data
 * @returns {Object} Processor and source nodes
 */
export function createAudioProcessor(audioContext, stream, onProcess) {
  if (!audioContext || !stream) {
    throw new Error('AudioContext and stream are required');
  }
  
  // Create source from stream
  const source = audioContext.createMediaStreamSource(stream);
  
  // Create processor with optimal buffer size
  // 4096 provides good balance between latency and performance
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  
  // Process audio data
  processor.onaudioprocess = (event) => {
    const inputData = event.inputBuffer.getChannelData(0);
    
    if (onProcess) {
      onProcess(inputData);
    }
  };
  
  // Connect nodes
  source.connect(processor);
  processor.connect(audioContext.destination);
  
  return { source, processor };
}

/**
 * Calculate current audio level for visualization
 * Returns normalized value between 0 and 1
 * @param {AnalyserNode} analyser - Web Audio analyser node
 * @returns {number} Audio level from 0 to 1
 */
export function calculateAudioLevel(analyser) {
  if (!analyser) {
    return 0;
  }
  
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  
  // Calculate RMS (Root Mean Square) for more accurate level
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i] * dataArray[i];
  }
  const rms = Math.sqrt(sum / dataArray.length);
  
  // Normalize to 0-1 range
  return Math.min(1, rms / 128);
}

/**
 * Resample audio data to different sample rate
 * Uses linear interpolation for basic resampling
 * @param {Float32Array} audioData - Input audio data
 * @param {number} fromSampleRate - Original sample rate
 * @param {number} toSampleRate - Target sample rate
 * @returns {Float32Array} Resampled audio data
 */
export function resampleAudio(audioData, fromSampleRate, toSampleRate) {
  if (!audioData || fromSampleRate <= 0 || toSampleRate <= 0) {
    throw new Error('Invalid resampling parameters');
  }
  
  // No resampling needed if rates match
  if (fromSampleRate === toSampleRate) {
    return audioData;
  }
  
  const ratio = fromSampleRate / toSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const resampled = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexInt = Math.floor(srcIndex);
    const srcIndexFrac = srcIndex - srcIndexInt;
    
    if (srcIndexInt + 1 < audioData.length) {
      // Linear interpolation between samples
      resampled[i] = audioData[srcIndexInt] * (1 - srcIndexFrac) +
                    audioData[srcIndexInt + 1] * srcIndexFrac;
    } else {
      // Use last sample if we're at the end
      resampled[i] = audioData[srcIndexInt];
    }
  }
  
  return resampled;
}

/**
 * Chunk audio data into smaller segments for streaming
 * @param {TypedArray} audioData - Audio data to chunk
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array} Array of audio chunks
 */
export function chunkAudioData(audioData, chunkSize = 4096) {
  if (!audioData || chunkSize <= 0) {
    throw new Error('Invalid chunking parameters');
  }
  
  const chunks = [];
  const numChunks = Math.ceil(audioData.length / chunkSize);
  
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, audioData.length);
    chunks.push(audioData.slice(start, end));
  }
  
  return chunks;
}

/**
 * Create a Web Audio context with fallbacks
 * Handles browser compatibility issues
 * @param {Object} options - AudioContext options
 * @returns {AudioContext} Audio context instance
 */
export function createAudioContext(options = {}) {
  const AudioContextClass = window.AudioContext || 
                            window.webkitAudioContext ||
                            window.mozAudioContext ||
                            window.msAudioContext;
  
  if (!AudioContextClass) {
    throw new Error('Web Audio API not supported in this browser');
  }
  
  // Default options for speech processing
  const defaultOptions = {
    sampleRate: 16000,
    latencyHint: 'interactive'
  };
  
  return new AudioContextClass({ ...defaultOptions, ...options });
}

/**
 * Check if audio format is supported
 * @param {string} mimeType - MIME type to check
 * @returns {boolean} Whether format is supported
 */
export function isAudioFormatSupported(mimeType) {
  const audio = document.createElement('audio');
  return audio.canPlayType(mimeType) !== '';
}

/**
 * Detect silence in audio buffer
 * Useful for voice activity detection
 * @param {Float32Array} buffer - Audio buffer to check
 * @param {number} threshold - Silence threshold (0-1)
 * @returns {boolean} Whether buffer contains silence
 */
export function detectSilence(buffer, threshold = 0.01) {
  if (!buffer) return true;
  
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += Math.abs(buffer[i]);
  }
  
  const average = sum / buffer.length;
  return average < threshold;
}

/**
 * Apply gain to audio buffer
 * @param {Float32Array} buffer - Audio buffer
 * @param {number} gain - Gain factor (1 = no change)
 * @returns {Float32Array} Adjusted audio buffer
 */
export function applyGain(buffer, gain = 1) {
  if (!buffer || gain === 1) {
    return buffer;
  }
  
  const output = new Float32Array(buffer.length);
  
  for (let i = 0; i < buffer.length; i++) {
    // Apply gain and clamp to [-1, 1]
    output[i] = Math.max(-1, Math.min(1, buffer[i] * gain));
  }
  
  return output;
}

/**
 * Create visualization data from audio
 * Generates frequency and waveform data for visualization
 * @param {AnalyserNode} analyser - Web Audio analyser
 * @returns {Object} Visualization data
 */
export function getVisualizationData(analyser) {
  if (!analyser) {
    return { frequencies: [], waveform: [] };
  }
  
  // Get frequency data
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);
  
  // Get waveform data
  const waveformData = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(waveformData);
  
  return {
    frequencies: Array.from(frequencyData),
    waveform: Array.from(waveformData),
    level: calculateAudioLevel(analyser)
  };
}

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (MM:SS)
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export all utilities
export default {
  convertFloat32ToInt16,
  convertInt16ToFloat32,
  createAudioProcessor,
  calculateAudioLevel,
  resampleAudio,
  chunkAudioData,
  createAudioContext,
  isAudioFormatSupported,
  detectSilence,
  applyGain,
  getVisualizationData,
  formatDuration,
  debounce
};
