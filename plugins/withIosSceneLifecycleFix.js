const { withInfoPlist, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Xcode 27 (the iOS 26 SDK) refuses to launch any app that doesn't declare
 * the UIScene life cycle — "UIScene life cycle is required for apps built
 * with this SDK" — regardless of which iOS version the app actually targets
 * or runs on, and regardless of the installed Expo SDK version. Building the
 * exact same project with an older Xcode never hits this at all. So this
 * plugin's job is Xcode-version-driven, not Expo-version-driven — but HOW it
 * adds scene support does depend on Expo's version:
 *
 * - expo >=57.0.23 ships its own `ExpoAppSceneDelegate` base class
 *   (ios/AppDelegates/ExpoAppSceneDelegate.swift in the `expo` package) that
 *   does the real work correctly — creating the window from the connecting
 *   scene, starting React Native in it, forwarding deep links/user
 *   activities/quick actions. Subclassing it is a couple of lines.
 * - Below that (or any other Expo/RN version without the class — this repo
 *   was on 57.0.22 until the bump that added this comment), there's nothing
 *   to subclass, so this falls back to a hand-rolled SceneDelegate that
 *   reuses the window AppDelegate already created and started React Native
 *   in, just re-parenting it onto the connecting scene.
 *
 * Declaring UIScene support is additive, not a breaking change — it's been
 * part of iOS since 13 (2019), years before it became mandatory. An app
 * built with this plugin still builds and runs fine on an older Xcode (26 or
 * earlier); nothing here is gated on which Xcode happens to build it.
 *
 * Safe to drop into any Expo project with a Swift `AppDelegate.swift`
 * (the default since Expo SDK ~53). Idempotent — re-running prebuild won't
 * double-inject. Warns instead of guessing if it can't find what it expects,
 * so a broken match surfaces at `expo prebuild` time instead of a runtime
 * crash. Verify per project: `npx expo prebuild --clean` then a real build —
 * this hasn't been tested against every possible AppDelegate.swift shape.
 */

const SCENE_CONFIG_METHOD = `
  // MARK: - UISceneSession Lifecycle
  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    let configuration = UISceneConfiguration(
      name: "Default Configuration",
      sessionRole: connectingSceneSession.role
    )
    configuration.delegateClass = SceneDelegate.self
    return configuration
  }
`;

const MODERN_SCENE_DELEGATE_CLASS = `
@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {}
`;

const FACTORY_PROVIDER_CONFORMANCE = `
extension AppDelegate: ExpoReactNativeFactoryProvider {}
`;

/**
 * Matches AppDelegate's own `window = UIWindow(frame:...); factory.startReactNative(...)`
 * block, tolerant of whitespace/formatting differences across Expo/RN
 * versions — anchored on the distinctive tokens rather than exact spacing.
 * Only removed on the modern path: once SceneDelegate creates the window and
 * starts React Native itself, leaving this in place would start a second
 * bridge/factory in a plain, scene-less window alongside the real one.
 */
const DIRECT_START_BLOCK_RE =
  /#if os\(iOS\)[^\n]*\n\s*window = UIWindow\(frame:[\s\S]*?factory\.startReactNative\([\s\S]*?\)\s*\n\s*#endif\n?/;

const LEGACY_SCENE_DELEGATE_CLASS = `
@objc(SceneDelegate)
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }

    let appDelegate = UIApplication.shared.delegate as? AppDelegate
    let targetWindow = appDelegate?.window ?? UIWindow(windowScene: windowScene)
    targetWindow.windowScene = windowScene
    self.window = targetWindow
    appDelegate?.window = targetWindow
    targetWindow.makeKeyAndVisible()

    if let url = connectionOptions.urlContexts.first?.url {
      _ = (UIApplication.shared.delegate as? AppDelegate)?.application(UIApplication.shared, open: url, options: [:])
    } else if let userActivity = connectionOptions.userActivities.first {
      _ = (UIApplication.shared.delegate as? AppDelegate)?.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    if let url = URLContexts.first?.url {
      _ = (UIApplication.shared.delegate as? AppDelegate)?.application(UIApplication.shared, open: url, options: [:])
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = (UIApplication.shared.delegate as? AppDelegate)?.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }

  func sceneDidBecomeActive(_ scene: UIScene) {
    (UIApplication.shared.delegate as? AppDelegate)?.applicationDidBecomeActive(UIApplication.shared)
  }

  func sceneWillResignActive(_ scene: UIScene) {
    (UIApplication.shared.delegate as? AppDelegate)?.applicationWillResignActive(UIApplication.shared)
  }

  func sceneWillEnterForeground(_ scene: UIScene) {
    (UIApplication.shared.delegate as? AppDelegate)?.applicationWillEnterForeground(UIApplication.shared)
  }

  func sceneDidEnterBackground(_ scene: UIScene) {
    (UIApplication.shared.delegate as? AppDelegate)?.applicationDidEnterBackground(UIApplication.shared)
  }
}
`;

/** Whether the installed `expo` package ships ExpoAppSceneDelegate (>=57.0.23) — checked by file, not by parsing a version number, so it stays correct across SDKs/majors. */
function hasExpoAppSceneDelegate(projectRoot) {
  try {
    const expoPackageJson = require.resolve("expo/package.json", { paths: [projectRoot] });
    const expoIosDir = path.join(path.dirname(expoPackageJson), "ios", "AppDelegates");
    return fs.existsSync(path.join(expoIosDir, "ExpoAppSceneDelegate.swift"));
  } catch {
    return false;
  }
}

const withIosSceneLifecycleFix = (config) => {
  config = withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).SceneDelegate",
          },
        ],
      },
    };
    return config;
  });

  return withDangerousMod(config, [
    "ios",
    (config) => {
      const appDelegatePath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        "AppDelegate.swift",
      );
      if (!fs.existsSync(appDelegatePath)) {
        console.warn(
          "[withIosSceneLifecycleFix] No AppDelegate.swift found at " +
            `${appDelegatePath} — skipping. If this project has an ` +
            "Objective-C AppDelegate.mm instead (pre-Expo-53 style), this " +
            "plugin doesn't handle that and needs a manual scene delegate.",
        );
        return config;
      }
      let contents = fs.readFileSync(appDelegatePath, "utf8");
      const modern = hasExpoAppSceneDelegate(config.modRequest.projectRoot);

      if (modern && DIRECT_START_BLOCK_RE.test(contents)) {
        contents = contents.replace(DIRECT_START_BLOCK_RE, "");
      }

      if (!contents.includes("configurationForConnecting")) {
        const classMatch = contents.match(
          /class AppDelegate:\s*ExpoAppDelegate[^{]*\{([\s\S]*?\n)\}/,
        );
        if (classMatch) {
          const [originalBlock, innerBody] = classMatch;
          const updatedBlock = `class AppDelegate: ExpoAppDelegate {${innerBody}${SCENE_CONFIG_METHOD}\n}`;
          contents = contents.replace(originalBlock, updatedBlock);
        } else {
          console.warn(
            "[withIosSceneLifecycleFix] Couldn't find `class AppDelegate: " +
              "ExpoAppDelegate { ... }` in AppDelegate.swift — the scene " +
              "config method wasn't added. Check the file manually.",
          );
        }
      }

      if (modern && !contents.includes("ExpoReactNativeFactoryProvider {}")) {
        contents = `${contents.trimEnd()}\n${FACTORY_PROVIDER_CONFORMANCE}`;
      }

      if (!contents.includes("class SceneDelegate")) {
        contents = `${contents.trimEnd()}\n${modern ? MODERN_SCENE_DELEGATE_CLASS : LEGACY_SCENE_DELEGATE_CLASS}`;
      }

      fs.writeFileSync(appDelegatePath, contents);
      return config;
    },
  ]);
};

module.exports = withIosSceneLifecycleFix;
