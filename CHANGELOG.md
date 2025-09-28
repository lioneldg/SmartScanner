# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.2.0] - 2025-01-XX

### Added

- **TextEditScreen**: Screen for editing and modifying extracted text
  - Intuitive user interface for editing scanned text
  - Copy and share text functionality
  - Complete localization support (French/English)
  - Comprehensive unit tests
- **ViewScanScreen**: Screen for viewing previous scans
  - Scan history display
  - Navigation to text editing
  - Scan metadata management (date, confidence)
  - Comprehensive unit tests
- Turbo Native Module support for Android (migration from Bridge)
- French text check script in package.json
- Comprehensive tests for ViewScanScreen
- Theme support in CameraService

### Changed

- Improved pre-commit hook configuration to use 'yarn check-all'
- Refactored HomeScreen layout
- Updated SettingsScreen styles
- **TextEditScreen**: Screen for editing and modifying extracted text
  - Intuitive user interface for editing scanned text
  - Copy and share text functionality
  - Complete localization support (French/English)
  - Comprehensive unit tests
- **ViewScanScreen**: Screen for viewing previous scans
  - Scan history display
  - Navigation to text editing
  - Scan metadata management (date, confidence)
  - Comprehensive unit tests

### Fixed

- Removed unnecessary title expectations from SettingsScreen tests

## [1.1.0] - 2025-01-XX

### Added

- **Complete SmartScanner application** with full OCR functionality
- **HomeScreen**: Main screen with scan button and OCR status
- **ScansScreen**: Scan history management
- **SettingsScreen**: Settings configuration (theme, language, OCR)
- Native OCR support for Android and iOS
- Navigation system with React Navigation
- State management with Zustand
- Internationalization (French/English) with i18next
- Theme system with light/dark support
- Unit tests with Jest and React Native Testing Library
- ESLint configuration and test setup
- Husky v9 configuration with pre-commit hooks
- Camera and storage permissions support
- Ionicons integration
- Adaptive OCR service with multi-platform support
- Camera service with OCR optimizations
- Date formatting service
- Knip configuration for dead code detection
- Gemfile.lock configuration for dependency management
- French text verification script to maintain code quality

### Fixed

- **Image crop header fix**: Improved image crop user interface
  - Resolved header display issues
  - Enhanced user experience during cropping
- Signing configuration for Android release builds
- Updated pre-commit hook to include coverage and knip

### Changed

- Migration to react-native-image-crop-picker for better integration
- Enhanced HomeScreen and CameraService tests for better error handling
- Harmonized import styles and cleaned up code formatting
- Updated project dependencies and permissions for camera and storage access

### Technical Details

- React Native 0.81.4
- TypeScript
- Zustand for state management
- i18next for internationalization
- Jest for testing
- ESLint for code quality
- Husky for Git hooks

## [1.0.0] - 2024-XX-XX

### Added

- **Initial SmartScanner application setup**
- Basic project structure and configuration
- React Native 0.81.4 foundation
- TypeScript configuration
- Basic navigation setup
- Initial dependencies and project scaffolding

---

## Change Types

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Features that will be removed in a future version
- **Removed**: Features removed in this version
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes
