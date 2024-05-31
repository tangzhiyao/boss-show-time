const PATHS = require("./paths");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const SidepanelPath = {
  vueHtmlTemplate: path.resolve(__dirname, "../template/vue/index.html"),
};

const sidepanel = {
  entry: {
    sidepanel: PATHS.src + "/sidepanel/main.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Sidepanel_html",
      filename: "sidepanel.html",
      template: SidepanelPath.vueHtmlTemplate,
      chunks: ["sidepanel"],
    }),
  ],
};

module.exports = sidepanel;
