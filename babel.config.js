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
            "#utils": ["./src/utils/index"],
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
      "react-native-reanimated/plugin",
    ],
  };
};
