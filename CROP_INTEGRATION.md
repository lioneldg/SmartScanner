# Image Cropping Integration with react-native-image-crop-picker

## Summary

The SmartScanner application has been updated to use `react-native-image-crop-picker` instead of `react-native-image-picker`. This update brings image cropping functionality that allows users to precisely select the area of the image on which to apply OCR.

## New Features

### Integrated Image Cropping

- **Free cropping**: Users can freely crop the area of interest
- **Rotation**: Ability to rotate the image during cropping
- **Native interface**: Uses the native cropping interface of iOS and Android
- **Theme colors**: The cropping interface uses the current theme colors of the application

### Cropping Options

- `cropping: true` - Enables cropping by default
- `freeStyleCropEnabled: true` - Allows free cropping
- `enableRotationGesture: true` - Enables rotation gestures
- `hideBottomControls: false` - Shows cropping controls
- Custom colors based on the current theme

## Usage

### Camera Capture with Cropping

```typescript
const result = await cameraService.captureFromCamera({
  cropping: true,
  freeStyleCropEnabled: true,
  enableRotationGesture: true,
});

// The result now contains cropping information
console.log(result.cropRect); // { x, y, width, height }
```

### Gallery Selection with Cropping

```typescript
const result = await cameraService.selectFromGallery({
  cropping: true,
  freeStyleCropEnabled: true,
});
```

### OCR Optimized Options

The OCR options have been updated to include cropping by default:

```typescript
const options = cameraService.getOcrOptimizedOptions();
// Now returns:
// {
//   quality: 0.9,
//   maxWidth: 1920,
//   maxHeight: 1920,
//   includeBase64: false,
//   cropping: true,
//   freeStyleCropEnabled: true,
//   hideBottomControls: false,
//   enableRotationGesture: true
// }
```

## Existing Integration

The integration in `HomeScreen` remains unchanged:

```typescript
const captureResult = await cameraService.showSourceSelection(
  cameraService.getOcrOptimizedOptions(),
  t
);
```

Now, when the user selects a source (camera or gallery), they will be automatically directed to the cropping interface to select the area of interest before OCR is applied.

## Technical Configuration

### Added Dependencies

- `react-native-image-crop-picker@0.51.0`

### iOS Configuration

- Permissions already configured in `Info.plist`
- CocoaPods installation successful with react-native-permissions v5 setup

### Android Configuration

- Permissions already configured in `AndroidManifest.xml`

### Tests

- All `CameraService` tests have been updated
- 30 tests pass successfully
- Mocks created for `react-native-image-crop-picker`

## Benefits for OCR

1. **Improved accuracy**: By allowing users to precisely crop the text, OCR can focus on the relevant area
2. **Noise reduction**: Elimination of non-relevant visual elements around the text
3. **Better quality**: Focus on the area of interest for better recognition
4. **User experience**: Intuitive interface to select exactly what should be scanned

## Compatibility

This update maintains compatibility with the existing API while adding new cropping features. Existing users will automatically benefit from cropping during their next image captures.