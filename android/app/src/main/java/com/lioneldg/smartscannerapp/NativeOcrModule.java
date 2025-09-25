package com.lioneldg.smartscannerapp;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;

import androidx.annotation.NonNull;

import org.json.JSONException;
import org.json.JSONObject;

public class NativeOcrModule extends NativeOcrSpec {
    private static final String TAG = "NativeOcrModule";
    private boolean isInitialized = false;
    private TextRecognizer textRecognizer;

    public NativeOcrModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(TAG, "NativeOcrModule constructor called - Module created successfully");
    }

    @Override
    public void initialize(String language, Promise promise) {
        try {
            // Initialize ML Kit Text Recognition
            textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
            
            isInitialized = true;
            WritableMap response = Arguments.createMap();
            response.putBoolean("success", true);
            response.putString("message", "ML Kit OCR initialized successfully");
            promise.resolve(response);
            
            Log.d(TAG, "ML Kit Text Recognition initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error initializing ML Kit OCR", e);
            WritableMap error = Arguments.createMap();
            error.putString("code", "INIT_EXCEPTION");
            error.putString("message", e.getMessage());
            promise.reject("INIT_EXCEPTION", e.getMessage(), error);
        }
    }

    @Override
    public void extractTextFromImage(ReadableArray imageDataArray, Promise promise) {
        if (!isInitialized) {
            WritableMap error = Arguments.createMap();
            error.putString("code", "NOT_INITIALIZED");
            error.putString("message", "OCR engine not initialized");
            promise.reject("NOT_INITIALIZED", "OCR engine not initialized", error);
            return;
        }

        try {
            long startTime = System.currentTimeMillis();
            
            // Convert ReadableArray to byte array
            byte[] imageData = new byte[imageDataArray.size()];
            for (int i = 0; i < imageDataArray.size(); i++) {
                imageData[i] = (byte) imageDataArray.getInt(i);
            }

            // Create bitmap from byte array
            Bitmap bitmap = BitmapFactory.decodeByteArray(imageData, 0, imageData.length);
            if (bitmap == null) {
                WritableMap error = Arguments.createMap();
                error.putString("code", "INVALID_IMAGE");
                error.putString("message", "Failed to decode image data");
                promise.reject("INVALID_IMAGE", "Failed to decode image data", error);
                return;
            }

            // Create InputImage for ML Kit
            InputImage image = InputImage.fromBitmap(bitmap, 0);

            // Process image with ML Kit
            textRecognizer.process(image)
                .addOnSuccessListener(new OnSuccessListener<Text>() {
                    @Override
                    public void onSuccess(@NonNull Text visionText) {
                        try {
                            long processingTime = System.currentTimeMillis() - startTime;
                            
                            // Extract text and calculate confidence
                            String extractedText = visionText.getText();
                            float totalConfidence = 0.0f;
                            int blockCount = 0;
                            
                            // Calculate average confidence from text blocks
                            for (Text.TextBlock block : visionText.getTextBlocks()) {
                                // ML Kit doesn't provide confidence scores directly
                                // We'll use a heuristic based on text quality
                                totalConfidence += calculateTextQuality(block.getText());
                                blockCount++;
                            }
                            
                            float averageConfidence = blockCount > 0 ? totalConfidence / blockCount : 0.0f;
                            
                            // Create result JSON
                            JSONObject result = new JSONObject();
                            result.put("text", extractedText.trim());
                            result.put("confidence", averageConfidence);
                            result.put("language", "eng");
                            result.put("processing_time_ms", processingTime);
                            
                            WritableMap response = Arguments.createMap();
                            response.putBoolean("success", true);
                            response.putString("result", result.toString());
                            promise.resolve(response);
                            
                        } catch (JSONException e) {
                            Log.e(TAG, "Error creating JSON result", e);
                            WritableMap error = Arguments.createMap();
                            error.putString("code", "JSON_ERROR");
                            error.putString("message", e.getMessage());
                            promise.reject("JSON_ERROR", e.getMessage(), error);
                        }
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.e(TAG, "Text recognition failed", e);
                        WritableMap error = Arguments.createMap();
                        error.putString("code", "RECOGNITION_ERROR");
                        error.putString("message", e.getMessage());
                        promise.reject("RECOGNITION_ERROR", e.getMessage(), error);
                    }
                });

        } catch (Exception e) {
            Log.e(TAG, "Error extracting text", e);
            WritableMap error = Arguments.createMap();
            error.putString("code", "EXTRACTION_EXCEPTION");
            error.putString("message", e.getMessage());
            promise.reject("EXTRACTION_EXCEPTION", e.getMessage(), error);
        }
    }

    /**
     * Calculate text quality heuristic since ML Kit doesn't provide confidence scores
     * Returns a value between 0-100 based on text characteristics
     */
    private float calculateTextQuality(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0.0f;
        }
        
        float quality = 80.0f; // Base quality score
        
        // Reduce quality for very short text (likely noise)
        if (text.length() < 3) {
            quality -= 30.0f;
        }
        
        // Increase quality for longer, structured text
        if (text.length() > 10) {
            quality += 10.0f;
        }
        
        // Check for common patterns that indicate good text
        if (text.matches(".*[a-zA-Z]{3,}.*")) { // Contains words with 3+ letters
            quality += 5.0f;
        }
        
        if (text.matches(".*\\d+.*")) { // Contains numbers
            quality += 2.0f;
        }
        
        // Reduce quality for excessive special characters (likely noise)
        long specialCharCount = text.chars()
            .filter(ch -> !Character.isLetterOrDigit(ch) && !Character.isWhitespace(ch))
            .count();
        
        if (specialCharCount > text.length() * 0.3) {
            quality -= 20.0f;
        }
        
        return Math.max(0.0f, Math.min(100.0f, quality));
    }
}
