// Navigation types for type-safe navigation
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Scans: undefined;
  TextEdit: {
    extractedText: string;
    imageUri?: string;
    confidence?: number;
  };
  ViewScan: {
    scan: {
      id: string;
      text: string;
      confidence: number;
      timestamp: number;
      imageUri?: string;
    };
  };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {
      // RootParamList extends RootStackParamList with all its properties
    }
  }
}
