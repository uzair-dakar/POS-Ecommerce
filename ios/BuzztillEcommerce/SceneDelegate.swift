import UIKit
import React_RCTAppDelegate

/**
 * Hosts the React Native root view in a UIWindowScene.
 *
 * iOS 26 made the scene lifecycle mandatory: an app that still builds its
 * window from the app delegate trips a UIKit runtime issue at launch, which
 * stops on a breakpoint under the debugger and is a hard failure on newer
 * systems. React Native 0.87 ships no scene helper of its own, so the window
 * is created here and handed to the same factory the app delegate builds.
 */
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }

    // The factory is owned by the app delegate so it outlives any one scene
    // and is only ever constructed once.
    guard
      let appDelegate = UIApplication.shared.delegate as? AppDelegate,
      let factory = appDelegate.reactNativeFactory
    else {
      return
    }

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    factory.startReactNative(
      withModuleName: AppDelegate.moduleName,
      in: window,
      launchOptions: appDelegate.launchOptions
    )
  }
}
