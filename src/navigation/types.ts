// Navigation types for type-safe navigation
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Scans: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
