import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  /** Matches AppRegistry.registerComponent in index.js. */
  static let moduleName = "BuzztillEcommerce"

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  /** Held for the scene, which connects after this runs. */
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?

  /**
   * Builds React Native but does not show it: under the scene lifecycle the
   * window belongs to SceneDelegate, and creating one here is exactly what
   * iOS 26 and later flag as a runtime issue.
   */
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    delegate.dependencyProvider = AppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = RCTReactNativeFactory(delegate: delegate)
    self.launchOptions = launchOptions

    return true
  }
}

/**
 * React Native's generated main-queue-setup list includes its own
 * SampleTurboModule, which no app links. Start-up then logs an error for a
 * module that was never meant to be there, and in development that surfaces as
 * a red screen over the app on every launch.
 *
 * Dropping that one name leaves every real module untouched.
 */
class AppDependencyProvider: RCTAppDependencyProvider {
  override func unstableModulesRequiringMainQueueSetup() -> [String] {
    super.unstableModulesRequiringMainQueueSetup()
      .filter { $0 != "SampleTurboModule" }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
