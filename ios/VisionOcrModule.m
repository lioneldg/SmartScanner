#import "VisionOcrModule.h"
#import <React/RCTLog.h>
#import <Vision/Vision.h>
#import <UIKit/UIKit.h>

@implementation VisionOcrModule

RCT_EXPORT_MODULE(VisionOcrModule);

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        NSLog(@"VisionOcrModule: Module initialized successfully");
    }
    return self;
}

RCT_EXPORT_METHOD(initialize:(NSString *)language
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    // Vision framework doesn't require initialization like Tesseract
    // Just check if it's available
    if (@available(iOS 13.0, *)) {
        NSDictionary *response = @{
            @"success": @YES,
            @"message": @"Vision OCR initialized successfully"
        };
        resolve(response);
    } else {
        NSDictionary *error = @{
            @"code": @"UNSUPPORTED_VERSION",
            @"message": @"Vision framework requires iOS 13.0 or later"
        };
        reject(@"UNSUPPORTED_VERSION", @"Vision framework requires iOS 13.0 or later", 
               [NSError errorWithDomain:@"VisionOcrModule" code:-1 userInfo:error]);
    }
}

RCT_EXPORT_METHOD(extractTextFromImage:(NSArray *)imageDataArray
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    
    if (@available(iOS 13.0, *)) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            @try {
                // Convert NSArray to NSData
                NSUInteger dataLength = [imageDataArray count];
                uint8_t *imageData = malloc(dataLength);
                
                for (NSUInteger i = 0; i < dataLength; i++) {
                    imageData[i] = (uint8_t)[[imageDataArray objectAtIndex:i] intValue];
                }
                
                NSData *data = [NSData dataWithBytes:imageData length:dataLength];
                free(imageData);
                
                [self performVisionOCR:data resolver:resolve rejecter:reject];
            } @catch (NSException *exception) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    NSDictionary *error = @{
                        @"code": @"EXTRACTION_EXCEPTION",
                        @"message": exception.reason ?: @"Unknown error"
                    };
                    reject(@"EXTRACTION_EXCEPTION", exception.reason, 
                           [NSError errorWithDomain:@"VisionOcrModule" code:-1 userInfo:error]);
                });
            }
        });
    } else {
        NSDictionary *error = @{
            @"code": @"UNSUPPORTED_VERSION",
            @"message": @"Vision framework requires iOS 13.0 or later"
        };
        reject(@"UNSUPPORTED_VERSION", @"Vision framework requires iOS 13.0 or later", 
               [NSError errorWithDomain:@"VisionOcrModule" code:-1 userInfo:error]);
    }
}

- (void)performVisionOCR:(NSData *)imageData 
                resolver:(RCTPromiseResolveBlock)resolve 
                rejecter:(RCTPromiseRejectBlock)reject API_AVAILABLE(ios(13.0)) {
    
    NSDate *startTime = [NSDate date];
    
    UIImage *image = [UIImage imageWithData:imageData];
    if (!image) {
        NSDictionary *error = @{
            @"code": @"INVALID_IMAGE",
            @"message": @"Failed to create image from data"
        };
        reject(@"INVALID_IMAGE", @"Failed to create image from data", 
               [NSError errorWithDomain:@"VisionOcrModule" code:-1 userInfo:error]);
        return;
    }
    
    VNRecognizeTextRequest *request = [[VNRecognizeTextRequest alloc] initWithCompletionHandler:^(VNRequest *request, NSError *error) {
        NSTimeInterval processingTime = [[NSDate date] timeIntervalSinceDate:startTime] * 1000; // Convert to milliseconds
        
        if (error) {
            dispatch_async(dispatch_get_main_queue(), ^{
                NSDictionary *errorDict = @{
                    @"code": @"VISION_ERROR",
                    @"message": error.localizedDescription
                };
                reject(@"VISION_ERROR", error.localizedDescription, 
                       [NSError errorWithDomain:@"VisionOcrModule" code:-1 userInfo:errorDict]);
            });
            return;
        }
        
        NSMutableString *recognizedText = [[NSMutableString alloc] init];
        float totalConfidence = 0.0;
        NSInteger observationCount = 0;
        
        for (VNRecognizedTextObservation *observation in request.results) {
            VNRecognizedText *topCandidate = [observation topCandidates:1].firstObject;
            if (topCandidate) {
                if (recognizedText.length > 0) {
                    [recognizedText appendString:@"\n"];
                }
                [recognizedText appendString:topCandidate.string];
                totalConfidence += topCandidate.confidence;
                observationCount++;
            }
        }
        
        float averageConfidence = observationCount > 0 ? (totalConfidence / observationCount) * 100 : 0.0;
        
        // Create result JSON matching the OCR native format
        NSDictionary *result = @{
            @"text": [recognizedText stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]],
            @"confidence": @(averageConfidence),
            @"language": @"eng", // Vision can detect language but we'll keep it simple
            @"processing_time_ms": @((NSUInteger)processingTime)
        };
        
        NSError *jsonError;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:result options:0 error:&jsonError];
        
        if (jsonError) {
            dispatch_async(dispatch_get_main_queue(), ^{
                NSDictionary *errorDict = @{
                    @"code": @"JSON_ERROR",
                    @"message": jsonError.localizedDescription
                };
                reject(@"JSON_ERROR", jsonError.localizedDescription, 
                       [NSError errorWithDomain:@"VisionOcrModule" code:-1 userInfo:errorDict]);
            });
            return;
        }
        
        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            NSDictionary *response = @{
                @"success": @YES,
                @"result": jsonString
            };
            resolve(response);
        });
    }];
    
    // Configure recognition for best accuracy
    request.recognitionLevel = VNRequestTextRecognitionLevelAccurate;
    
    // Enable automatic language detection if available
    if (@available(iOS 16.0, *)) {
        request.automaticallyDetectsLanguage = YES;
    }
    
    // Set recognition languages if available
    if (@available(iOS 14.0, *)) {
        request.recognitionLanguages = @[@"en-US", @"fr-FR", @"de-DE", @"es-ES", @"it-IT"];
    }
    
    // Create image request handler
    VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithCGImage:image.CGImage options:@{}];
    
    NSError *handlerError;
    BOOL success = [handler performRequests:@[request] error:&handlerError];
    
    if (!success || handlerError) {
        dispatch_async(dispatch_get_main_queue(), ^{
            NSDictionary *errorDict = @{
                @"code": @"HANDLER_ERROR",
                @"message": handlerError ? handlerError.localizedDescription : @"Unknown handler error"
            };
            reject(@"HANDLER_ERROR", 
                   handlerError ? handlerError.localizedDescription : @"Unknown handler error", 
                   [NSError errorWithDomain:@"VisionOcrModule" code:-1 userInfo:errorDict]);
        });
    }
}

@end
