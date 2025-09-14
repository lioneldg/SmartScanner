const ImagePicker = {
  openCamera: jest.fn(() => Promise.resolve({
    path: 'file://test-camera-image.jpg',
    data: 'base64-image-data',
    filename: 'test-camera-image.jpg',
    size: 1024000,
    width: 1920,
    height: 1080,
    mime: 'image/jpeg',
    cropRect: {
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
    },
  })),

  openPicker: jest.fn(() => Promise.resolve({
    path: 'file://test-gallery-image.jpg',
    data: 'base64-image-data',
    filename: 'test-gallery-image.jpg',
    size: 2048000,
    width: 2048,
    height: 1536,
    mime: 'image/jpeg',
    cropRect: {
      x: 100,
      y: 100,
      width: 1848,
      height: 1336,
    },
  })),

  clean: jest.fn(() => Promise.resolve()),

  cleanSingle: jest.fn(() => Promise.resolve()),
};

module.exports = ImagePicker;
