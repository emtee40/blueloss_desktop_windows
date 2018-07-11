// @ts-nocheck
const path = require('path')

const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const projectDir = path.resolve(__dirname)
const appDir = path.join(projectDir, 'app')
const mainDir = path.join(appDir, 'main')
const mainAppEntryPoint = path.join(mainDir, 'appMain.lsc')
const settingsWindowRendererDir = path.join(appDir, 'settingsWindow', 'renderer')
const settingsWindowRendererEntryPoint = path.join(settingsWindowRendererDir, 'settingsWindowRendererMain.lsc')
const bluetoothRendererDir = path.join(appDir, 'bluetooth', 'renderer')
const bluetoothRendererEntryPoint = path.join(bluetoothRendererDir, 'bluetoothRendererMain.lsc')
const ISDEV = process.env.NODE_ENV !== 'production'

console.log('ISDEV: ', ISDEV)
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV)

/*****
* We dont want webpack to include polyfills or mocks for various node stuff, which we set with
* the 'node' key https://webpack.js.org/configuration/node/
* We also dont want webpack to transpile the stuff in node_modules folder, so we use the
* webpack-node-externals plugin.
*/

const commonWebpackOptions = {
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false
  },
  mode: process.env.NODE_ENV,
  devtool: ISDEV ? 'source-map' : 'none',
  context: projectDir,
  module: {
    rules: [
      {
        test: /.lsc/,
        exclude: [
          /(node_modules)/
        ],
        loader: 'babel-loader',
        options: {
          sourceMap: ISDEV
        }
      },
    ]
  },
  resolve: {
    extensions: ['.lsc', '.js']
  },
  externals: [nodeExternals()],
  optimization: {
    minimize: false
  },
  plugins: [
    // Gonna still use DefinePlugin as its a bit shorter than using global.ISDEV.
    new webpack.DefinePlugin({
      ISDEV
    })
  ]
}

const electronMainWebpackOptions = {
  ...commonWebpackOptions,
  ...{
    target: 'electron-main',
    entry: mainAppEntryPoint,
    output: {
      filename: 'appMain-compiled.js',
      path: mainDir
    }
  }
}

const electronSettingsRendererWebpackOptions = {
  ...commonWebpackOptions,
  ...{
    target: 'electron-renderer',
    entry: settingsWindowRendererEntryPoint,
    output: {
      filename: 'settingsWindowRendererMain-compiled.js',
      path: settingsWindowRendererDir
    }
  }
}

const bluetoothRendererWebpackOptions = {
  ...commonWebpackOptions,
  ...{
    target: 'electron-renderer',
    entry: bluetoothRendererEntryPoint,
    output: {
      filename: 'bluetoothRendererMain-compiled.js',
      path: bluetoothRendererDir
    }
  }
}

module.exports = [
  electronMainWebpackOptions,
  electronSettingsRendererWebpackOptions,
  bluetoothRendererWebpackOptions,
]
