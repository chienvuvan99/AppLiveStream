#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <AVFoundation/AVFoundation.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"AppLiveStream";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // <-- Add this section -->
    AVAudioSession *session = AVAudioSession.sharedInstance;
    NSError *error = nil;

    if (@available(iOS 10.0, *)) {
        [session
          setCategory:AVAudioSessionCategoryPlayAndRecord
          mode:AVAudioSessionModeVoiceChat
          options:AVAudioSessionCategoryOptionDefaultToSpeaker|AVAudioSessionCategoryOptionAllowBluetooth
          error:&error];
      } else {
        SEL selector = NSSelectorFromString(@"setCategory:withOptions:error:");
        
        NSArray * optionsArray =
            [NSArray arrayWithObjects:
              [NSNumber numberWithInteger:AVAudioSessionCategoryOptionAllowBluetooth],
              [NSNumber numberWithInteger:AVAudioSessionCategoryOptionDefaultToSpeaker], nil];
        
        [session
          performSelector:selector
          withObject: AVAudioSessionCategoryPlayAndRecord
          withObject: optionsArray
        ];
        
        [session
          setMode:AVAudioSessionModeVoiceChat
          error:&error
        ];
      }
      
      [session
        setActive:YES
        error:&error
      ];
      // <-- Add this section -->
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
  
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
