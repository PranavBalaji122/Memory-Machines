# 🛠️ Utility Functions

> Helper functions and utilities for the Sentiment Aura application

## 📋 Overview

This directory contains utility functions that provide reusable functionality across the application. These utilities handle audio processing, data formatting, validation, and other common tasks.

## 📁 Files

### 🔊 audioUtils.js

**Purpose**: Audio processing and manipulation utilities

**Functions**:

#### `convertFloat32ToInt16(buffer)`
Converts Float32Array audio data to Int16Array for Deepgram compatibility
```javascript
const int16Data = convertFloat32ToInt16(float32Buffer);
```

#### `createAudioProcessor(audioContext, stream)`
Creates a ScriptProcessorNode for audio streaming
```javascript
const processor = createAudioProcessor(audioContext, mediaStream);
```

#### `calculateAudioLevel(analyser)`
Calculates the current audio level for visualization
```javascript
const level = calculateAudioLevel(analyserNode); // Returns 0-1
```

#### `resampleAudio(audioData, fromSampleRate, toSampleRate)`
Resamples audio data to match Deepgram requirements
```javascript
const resampled = resampleAudio(audioData, 48000, 16000);
```

#### `chunckAudioData(audioData, chunkSize)`
Splits audio data into chunks for streaming
```javascript
const chunks = chunckAudioData(audioData, 4096);
```

## 🎯 Utility Categories

### Audio Processing
- Sample rate conversion
- Format conversion (Float32 ↔ Int16)
- Audio level detection
- Chunking for streaming

### Data Formatting
- Timestamp formatting
- Text truncation with ellipsis
- Number formatting (sentiment scores)
- Array deduplication

### Validation
- API key validation
- URL validation
- Text length validation
- Audio format validation

### Performance
- Debouncing functions
- Throttling functions
- Memoization helpers
- Batch processing

## 💡 Usage Examples

### Audio Processing Pipeline
```javascript
import {
  convertFloat32ToInt16,
  resampleAudio,
  chunckAudioData
} from './utils/audioUtils';

// Process audio for Deepgram
function processAudioForStreaming(audioBuffer) {
  // 1. Resample to 16kHz if needed
  const resampled = resampleAudio(audioBuffer, 48000, 16000);
  
  // 2. Convert to Int16
  const int16Data = convertFloat32ToInt16(resampled);
  
  // 3. Chunk for streaming
  const chunks = chunckAudioData(int16Data, 4096);
  
  return chunks;
}
```

### Audio Level Monitoring
```javascript
import { calculateAudioLevel } from './utils/audioUtils';

// Monitor microphone level
function monitorAudioLevel(stream) {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  
  setInterval(() => {
    const level = calculateAudioLevel(analyser);
    updateVolumeIndicator(level);
  }, 100);
}
```

## 🔧 Implementation Details

### Audio Format Conversion
The application needs to convert between different audio formats:
- **Browser**: Float32Array (Web Audio API standard)
- **Deepgram**: Int16Array (Linear16 encoding)

### Sample Rate Considerations
- **Browser default**: Often 48kHz or 44.1kHz
- **Deepgram optimal**: 16kHz for speech
- **Resampling**: Necessary for optimal performance

### Buffer Sizes
- **ScriptProcessor**: 4096 samples (best balance)
- **Streaming chunks**: 2048-4096 bytes
- **Latency target**: < 100ms

## 🧪 Testing Utilities

```javascript
// Test audio conversion
describe('audioUtils', () => {
  describe('convertFloat32ToInt16', () => {
    it('should convert float values correctly', () => {
      const float32 = new Float32Array([0, 0.5, 1, -0.5, -1]);
      const int16 = convertFloat32ToInt16(float32);
      expect(int16).toEqual(new Int16Array([0, 16383, 32767, -16384, -32768]));
    });
  });
  
  describe('calculateAudioLevel', () => {
    it('should return value between 0 and 1', () => {
      const level = calculateAudioLevel(mockAnalyser);
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(1);
    });
  });
});
```

## 🎯 Best Practices

### DO's
- ✅ Handle edge cases (empty buffers, null values)
- ✅ Validate input parameters
- ✅ Use TypedArrays for performance
- ✅ Clean up resources (close contexts, disconnect nodes)
- ✅ Document complex algorithms

### DON'Ts
- ❌ Don't mutate input arrays
- ❌ Don't create multiple AudioContexts
- ❌ Don't block the main thread with processing
- ❌ Don't ignore sample rate mismatches

## 📊 Performance Considerations

### Memory Management
- Reuse buffers when possible
- Clear references to large arrays
- Use transferable objects for workers

### Processing Optimization
- Use Web Workers for heavy processing
- Batch operations when possible
- Cache frequently used calculations

### Streaming Efficiency
- Optimal chunk sizes for network
- Minimize latency in pipeline
- Handle backpressure properly

## 🔍 Debugging Tips

### Audio Issues
```javascript
// Debug audio levels
console.log('Audio level:', calculateAudioLevel(analyser));

// Check sample rate
console.log('Sample rate:', audioContext.sampleRate);

// Monitor buffer sizes
console.log('Buffer size:', processor.bufferSize);
```

### Performance Monitoring
```javascript
// Measure processing time
console.time('audioProcessing');
const processed = processAudio(data);
console.timeEnd('audioProcessing');

// Check memory usage
console.log('Memory:', performance.memory);
```

---

*Essential utilities powering Sentiment Aura's audio pipeline*
