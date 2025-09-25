import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

interface OcrInitializeResponse {
  success: boolean;
  message: string;
}

interface OcrExtractResponse {
  success: boolean;
  result: string;
}

interface Spec extends TurboModule {
  initialize(language: string): Promise<OcrInitializeResponse>;
  extractTextFromImage(imageData: number[]): Promise<OcrExtractResponse>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("NativeOcr");
