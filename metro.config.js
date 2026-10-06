const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const dayjsRoot = path.resolve(projectRoot, "node_modules/dayjs");
const dayjsLocaleShim = path.resolve(
  projectRoot,
  "src/shims/dayjs-locale.js"
);

module.exports = (async () => {
  const config = await getDefaultConfig(projectRoot);
  config.resolver.unstable_conditionNames = [
    "browser",
    "require",
    "react-native",
  ];

  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    dayjs: dayjsRoot,
  };

  const defaultResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Map Jitsi's bulk locale imports to a project file Metro can watch.
    if (moduleName.startsWith("dayjs/locale/")) {
      return { type: "sourceFile", filePath: dayjsLocaleShim };
    }

    if (defaultResolveRequest) {
      return defaultResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  };

  return {
    ...config,
    transformer: {
      ...config.transformer,
      babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      ...config.resolver,
      extraNodeModules: config.resolver.extraNodeModules,
      resolveRequest: config.resolver.resolveRequest,
      assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...config.resolver.sourceExts, "svg"],
    },
  };
})();
