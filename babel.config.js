module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "#components": ["./src/components/index"],
            "#styles": ["./src/styles/index"],
            "#blocks": ["./src/blocks/index"],
            "#services": ["./src/services/index"],
            "#hooks": ["./src/hooks/index"],
            "#screens": ["./src/screens/index"],
            "#utils": ["./src/utils/index"],
            "#navigation": ["./src/navigation/index"],
            "#backdrops": ["./src/backdrops/index"],
          },
          extensions: [
            ".ios.js",
            ".android.js",
            ".js",
            ".jsx",
            ".json",
            ".tsx",
            ".ts",
            ".native.js",
          ],
        },
      ],
      "@babel/plugin-proposal-export-namespace-from",
      "react-native-reanimated/plugin",
    ],
  };
};
