const { withInfoPlist, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * `ExpoAppSceneDelegate` (expo >=57.0.23, see ios/AppDelegates/ExpoAppSceneDelegate.swift
 * in the `expo` package) does everything a scene delegate needs — creating the
 * window from the connecting scene, starting React Native in it, and forwarding
 * deep links/user activities/quick actions back to the app delegate. Subclassing
 * it directly means this plugin no longer has to hand-roll that forwarding itself.
 */
const SCENE_DELEGATE_CLASS = `
@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {}
`;

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

const FACTORY_PROVIDER_CONFORMANCE = `
extension AppDelegate: ExpoReactNativeFactoryProvider {}
`;

/**
 * The window is now created by SceneDelegate (from the connecting UIWindowScene)
 * instead of here — starting React Native a second time in a plain, scene-less
 * `UIWindow(frame:)` would spin up a second bridge/factory alongside the one the
 * scene delegate starts.
 */
const OLD_DIRECT_START_BLOCK = `
#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif
`;

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
        return config;
      }
      let contents = fs.readFileSync(appDelegatePath, "utf8");

      if (contents.includes(OLD_DIRECT_START_BLOCK.trim())) {
        contents = contents.replace(`${OLD_DIRECT_START_BLOCK.trim()}\n`, "");
      }

      if (!contents.includes("configurationForConnecting")) {
        const classMatch = contents.match(
          /class AppDelegate:\s*ExpoAppDelegate\s*\{([\s\S]*?\n)\}/,
        );
        if (classMatch) {
          const originalBlock = classMatch[0];
          const innerBody = classMatch[1];
          const updatedBlock = `class AppDelegate: ExpoAppDelegate {${innerBody}${SCENE_CONFIG_METHOD}\n}`;
          contents = contents.replace(originalBlock, updatedBlock);
        }
      }

      if (!contents.includes("ExpoReactNativeFactoryProvider {}")) {
        contents = `${contents.trimEnd()}\n${FACTORY_PROVIDER_CONFORMANCE}`;
      }

      if (!contents.includes("class SceneDelegate")) {
        contents = `${contents.trimEnd()}\n${SCENE_DELEGATE_CLASS}`;
      }

      fs.writeFileSync(appDelegatePath, contents);
      return config;
    },
  ]);
};

module.exports = withIosSceneLifecycleFix;
