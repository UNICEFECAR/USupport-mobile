const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname); // Ensure `__dirname` is passed
  config.resolver.unstable_conditionNames = [
    "browser",
    "require",
    "react-native",
  ];

  return {
    ...config, // Keep default configurations
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
      assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...config.resolver.sourceExts, "svg"],
    },
  };
})();
