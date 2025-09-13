# SmartScanner - Native OCR Setup

This documentation explains how to use the native OCR modules in SmartScanner.

## Overview

SmartScanner uses native OCR solutions optimized for each platform:

- **Android**: Google ML Kit Text Recognition (offline, free)
- **iOS**: Apple Vision Framework (iOS 13+)

## Advantages

✅ **High Performance**: Native optimized solutions
✅ **Simplicity**: No complex external dependencies  
✅ **Offline**: Works without internet connection
✅ **Free**: No API costs
✅ **Maintenance**: Automatic updates with OS

## Architecture

```
SmartScanner/
├── android/app/src/main/java/com/smartscanner/
│   ├── OcrModule.java       # Android Bridge (ML Kit)
│   └── OcrPackage.java      # Android Package
├── ios/
│   ├── VisionOcrModule.h    # iOS Header (Vision framework)
│   └── VisionOcrModule.m    # iOS Bridge (Vision framework)
└── src/services/
    └── AdaptiveOcrService.ts # Adaptive OCR Service
```

## Prerequisites

### General

- Node.js ≥ 20
- React Native CLI
- Yarn (package manager)

### Android

- Android Studio
- API Level 21+ (Android 5.0+)
- Google Play Services
- Gradle 7.0+

### iOS

- Xcode 14+
- iOS 13+ (for Vision framework)
- CocoaPods

## Installation

### 1. React Native Dependencies

```bash
yarn install
```

### 2. Android - ML Kit

ML Kit dependencies are automatically configured in `android/app/build.gradle`:

```gradle
dependencies {
    implementation 'com.google.mlkit:text-recognition:16.0.1'
}
```

### 3. iOS - Vision Framework

The Vision framework is natively included in iOS 13+. No configuration required.

### 4. iOS Pods Installation

```bash
cd ios && pod install && cd ..
```

### 5. Native Modules Configuration

#### Android - Automatic Configuration

The Android module is automatically registered via `OcrPackage.java` in `MainApplication.kt`.

#### iOS - Automatic Configuration

The iOS module is automatically registered via `VisionOcrModule.h` and `VisionOcrModule.m`.

## Usage

### Adaptive OCR Service

```typescript
import { adaptiveOcrService } from '../services/AdaptiveOcrService';

// Initialize OCR
await adaptiveOcrService.initialize({ language: 'eng' });

// Extract text from image
const result = await adaptiveOcrService.extractTextFromUri(imageUri);

console.log('Text:', result.text);
console.log('Confidence:', result.confidence);

// Platform information
const info = adaptiveOcrService.getPlatformInfo();
console.log(`${info.engine} on ${info.platform}`);
```

### Camera Service

```typescript
import { cameraService } from '../services/CameraService';

// Capture image with source selection
const image = await cameraService.showSourceSelection();

// Or directly from camera
const cameraImage = await cameraService.captureFromCamera();
```

### Zustand Store

```typescript
import { useScanStore } from '../store';

const { addScanResult, scanHistory, getStatistics } = useScanStore();

// Add result
addScanResult(scanResult);

// Statistics
const stats = getStatistics();
```

## Features

### Automatic Content Detection

The service automatically detects content type:

- URLs
- Email addresses
- Phone numbers
- General text

### Supported Languages

- **Android (ML Kit)**: Automatic detection, multilingual support
- **iOS (Vision)**: Automatic detection, 10+ languages

### Quality and Confidence

- **Android**: Heuristic based on text quality
- **iOS**: Native confidence score from Vision framework

## Performance

### Android - ML Kit

- ⚡ Very fast (< 500ms average)
- 🔋 Battery optimized
- 📱 Works on all Android 5.0+ devices

### iOS - Vision

- ⚡ Ultra fast (< 300ms average)
- 🎯 Very accurate
- 🔋 Apple optimized

## Testing

```bash
# Android
yarn android

# iOS
yarn ios
```

## Troubleshooting

### Android

1. **ML Kit Error**: Verify Google Play Services is installed
2. **Permissions**: App automatically handles camera permissions

### iOS

1. **iOS < 13**: Vision framework not available
2. **Permissions**: App automatically requests camera access

### General

1. **Blurry Image**: Use sharp and well-lit images
2. **Low Confidence**: Improve source image quality

## API Reference

### AdaptiveOcrService

#### Methods

- `initialize(config?: Partial<OcrConfiguration>): Promise<void>`
- `extractTextFromImage(imageData: ImageData): Promise<ScanResult>`
- `extractTextFromUri(uri: string): Promise<ScanResult>`
- `extractTextFromBase64(base64: string): Promise<ScanResult>`
- `updateSettings(settings: Partial<OcrSettings>): void`
- `getSettings(): OcrSettings`
- `isReady(): boolean`
- `getCurrentLanguage(): OcrLanguage`
- `getPlatformInfo(): { platform: string; engine: string }`
- `reset(): void`

#### Types

```typescript
interface ScanResult {
  id: string;
  text: string;
  confidence: number;
  language: string;
  processing_time_ms: number;
  timestamp: number;
  imageUri?: string;
  type: 'text' | 'url' | 'email' | 'phone' | 'unknown';
}

interface OcrSettings {
  language: OcrLanguage;
  autoDetectTextType: boolean;
  minimumConfidence: number;
  preprocessImage: boolean;
}

interface ImageData {
  uri?: string;
  base64?: string;
  bytes?: number[];
}

type OcrLanguage =
  | 'eng' // English
  | 'fra' // French
  | 'deu' // German
  | 'spa' // Spanish
  | 'ita' // Italian
  | 'por' // Portuguese
  | 'rus' // Russian
  | 'chi_sim' // Chinese Simplified
  | 'chi_tra' // Chinese Traditional
  | 'jpn' // Japanese
  | 'kor'; // Korean
```

## Technical Details

### Android - ML Kit Implementation

- **Module**: `OcrModule.java`
- **Package**: `OcrPackage.java`
- **Dependency**: `com.google.mlkit:text-recognition:16.0.1`
- **Confidence**: Calculated via heuristic based on text quality
- **Performance**: Asynchronous processing with callbacks

### iOS - Vision Framework Implementation

- **Module**: `VisionOcrModule.m`
- **Header**: `VisionOcrModule.h`
- **Framework**: Vision (iOS 13+)
- **Confidence**: Native confidence score from Vision framework
- **Performance**: Asynchronous processing with dispatch queues

### Adaptive Service

- **Singleton**: `adaptiveOcrService`
- **Auto-detection**: Platform (Android/iOS)
- **Error handling**: Try-catch with detailed messages
- **Content types**: URL, email, phone, text

## Support

- **Android**: ML Kit Text Recognition v16.0.1+
- **iOS**: Vision framework (iOS 13+)
- **React Native**: 0.81.1+
