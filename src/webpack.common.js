const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|vs|fs)$/,
        loader: 'ts-shader-loader',
      },
      {
        test: /\.(jpe?g|gif|png|tif?f|tga|svg|woff|ttf|wav|mp3|json)$/,
        type: "asset/resource"
      }
    ],
  },
  // resolve: {
  //   alias: {
  //     three: path.resolve('./node_modules/three')
  //     // For three-mesh-ui
  //     // 'three/.*$': 'three',
  //     // // don't need to register alias for every module
  //   },
  //   extensions: ['.tsx', '.ts', '.js'],
  // },
  // For three-mesh-ui
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     'THREE': 'three'
  //   }),
  // ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist'),
    assetModuleFilename: (pathData) => {
      const filepath = path
        .dirname(pathData.filename)
        .split("/")
        .slice(1)
        .join("/");
      return `${filepath}/[name].[ext][query]`;
    },
  },
};
