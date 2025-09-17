# SmartScanner 📱

**Your intelligent scanning solution with native text recognition**

SmartScanner is a modern mobile application that uses native optical character recognition (OCR) to extract text from images and documents. Designed for Android and iOS, it delivers optimal performance through the use of each platform's native frameworks.

## ✨ Features

- 🔍 **Native text recognition** - Uses Google ML Kit (Android) and Apple Vision (iOS)
- 📸 **Image capture** - Built-in camera and gallery selection
- 🌐 **Multilingual** - Automatic language detection support
- 🎨 **Modern interface** - Light/dark themes with adaptive design
- 💾 **Scan history** - Save and manage your scans
- 📋 **Quick copy** - Copy extracted text to clipboard
- 🔒 **Offline** - Works without internet connection
- ⚡ **Performance** - Fast and optimized processing

## 🚀 Installation

### Prerequisites

- **Node.js** ≥ 20
- **Yarn** (package manager)
- **Android Studio** (for Android)
- **Xcode** (for iOS)

### Install dependencies

```bash
# Clone the project
git clone <repository-url>
cd SmartScanner

# Install dependencies
yarn install
```

### iOS Configuration

```bash
# Install CocoaPods dependencies
cd ios
pod install
cd ..
```

## 🏃‍♂️ Running the app

### Start development server

```bash
yarn start
```

### Android

```bash
yarn android
```

### iOS

```bash
yarn ios
```

## 🛠️ Development

### Testing

```bash
# Run all tests
yarn test

# Tests with coverage
yarn test --coverage
```

### Linting

```bash
yarn lint
```

## 📱 Usage

1. **Launch the application** on your device or simulator
2. **Allow camera access** when prompted
3. **Tap "Start Scanning"** to capture an image
4. **Text will be automatically extracted** and displayed
5. **Copy the text** or view history in the "Scans" tab

## 🏗️ Technical Architecture

- **React Native** 0.81+ with TypeScript
- **Navigation**: React Navigation v7
- **Global state**: Zustand
- **Native OCR**: Google ML Kit (Android) / Apple Vision (iOS)
- **Internationalization**: i18next
- **Testing**: Jest + React Native Testing Library

## 📋 Requirements

- **Android**: API Level 21+ (Android 5.0+)
- **iOS**: iOS 13+ (for Vision framework)
- **Memory**: 2GB RAM minimum
- **Storage**: 100MB free space

## 🔧 Troubleshooting

### Common issues

- **OCR Error**: Restart the application
- **Permissions denied**: Check device settings
- **Slow performance**: Close other applications

### Support

For help or to report an issue, check the project's Issues section.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

**Developed with ❤️ in React Native**
