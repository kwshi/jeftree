module.exports = {
  parser: "postcss-scss",
  plugins: [
    require("postcss-import"),
    require("postcss-nested"),
    require("autoprefixer"),
  ],
};
