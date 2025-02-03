const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map((filename) => {
    return new HtmlWebpackPlugin({
      filename,
      template: path.resolve(__dirname, `${templateDir}/${filename}`),
      inject: false,
      cache: false,
    });
  });
}

const htmlPlugins = generateHtmlPlugins("src/html/views");

const config = {
  entry: ["./src/js/index.js", "./src/scss/style.scss"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/bundle.js",
  },
  devtool: "source-map",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(sass|scss)$/,
        include: path.resolve(__dirname, "src/scss"),
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              url: false,
            },
          },
          "sass-loader"
        ],
      },
      {
        test: /\.html$/,
        include: path.resolve(__dirname, "src/html/includes"),
        use: ["raw-loader"]
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/style.bundle.css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/fonts", to: "fonts" },
        { from: "src/favicon", to: "favicon" },
        { from: "src/img", to: "img" },
      ],
    }),
    ...htmlPlugins
  ],
  devServer: {
    port: 9000,
    hot: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    watchFiles: [
      'src/html/**/*.html',
      'src/**/*.scss',
      'src/js/**/*.js'
    ],
  },
};

module.exports = (_env, argv) => {
  if (argv.mode === "production") {
    config.mode = "production";
    config.plugins.push(new CleanWebpackPlugin());
  }
  return config;
};