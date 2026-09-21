const { withInfoPlist, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

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

const SCENE_DELEGATE_CLASS = `
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

      if (!contents.includes("class SceneDelegate")) {
        contents = `${contents.trimEnd()}\n${SCENE_DELEGATE_CLASS}\n`;
      }

      fs.writeFileSync(appDelegatePath, contents);
      return config;
    },
  ]);
};

module.exports = withIosSceneLifecycleFix;
