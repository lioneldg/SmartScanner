// Navigation types for type-safe navigation
export type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
