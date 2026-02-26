const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const disableDevOverlay = Boolean(process.env.CI);

  return {
    mode: argv.mode || "development",
    entry: "./index.web.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "bundle.[contenthash].js" : "bundle.js",
      chunkFilename: isProduction ? "[name].[contenthash].js" : "[name].js",
      publicPath: isProduction ? "" : "/",
    },
    resolve: {
      extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
      alias: {
        "@": path.resolve(__dirname, "src"),
        "react-native$": "react-native-web",
        "react-native-vector-icons": "react-native-vector-icons/dist",
        "react-native-reanimated": path.resolve(
          __dirname,
          "src/mocks/react-native-reanimated.web.js",
        ),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude:
            /node_modules\/(?!(react-native-vector-icons|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-native|@react-navigation|expo|expo-.*|@expo|expo-modules-core)\/).*/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
              ],
              plugins: [
                ["@babel/plugin-transform-class-properties", { loose: true }],
                ["@babel/plugin-transform-private-methods", { loose: true }],
                [
                  "@babel/plugin-transform-private-property-in-object",
                  { loose: true },
                ],
                // NOTE: react-native-reanimated/plugin is intentionally omitted here.
                // On web, reanimated is aliased to a no-op stub (src/mocks/react-native-reanimated.web.js).
                // The plugin is only needed for Metro (native) builds.
              ],
            },
          },
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          type: "asset/resource",
        },
        {
          test: /\.ttf$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProduction),
        "process.env.NODE_ENV": JSON.stringify(
          isProduction ? "production" : "development",
        ),
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "public"),
      },
      headers: {
        "Cache-Control": "no-store",
      },
      client: {
        overlay: !disableDevOverlay,
      },
      historyApiFallback: true,
      port: 3000,
      open: true,
    },
  };
};
