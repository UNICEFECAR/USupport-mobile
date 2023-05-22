const path = require("path");

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: [path.resolve("./")],
          alias: {
            "#components": [path.resolve("./src/components/index")],
            "#styles": [path.resolve("./src/styles/index")],
            "#blocks": [path.resolve("./src/blocks/index")],
            "#services": [path.resolve("./src/services/index")],
            "#hooks": [path.resolve("./src/hooks/index")],
            "#screens": [path.resolve("./src/screens/index")],
            "#utils": [path.resolve("./src/utils/index")],
            "#navigation": [path.resolve("./src/navigation/index")],
            "#backdrops": [path.resolve("./src/backdrops/index")],
            "#assets": [path.resolve("./src/assets/index")],
            "#modals": [path.resolve("./src/modals/index")],
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
