import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import webpack, { SourceMapDevToolPlugin } from 'webpack'
import webpackDevServer from 'webpack-dev-server'

import pkg from './package.json'

const alias = Object.fromEntries(
  Object.entries( pkg._moduleAliases )
    .map( ( [ key, value ] ) => [ key, path.join( __dirname, value ) ] )
)

interface Config extends webpack.Configuration {
  devServer?: webpackDevServer.Configuration
}

const config: Config = {
  entry: path.resolve( 'src', 'index.web.tsx' ),
  output: {
    filename: 'main.bundle.js',
    publicPath: process.env.NODE_ENV === 'production' ? '/public/' : '/',
  },
  module: {
    rules: [ {
      test: /\.[jt]sx?$/,
      use: [ 'babel-loader', 'ts-loader' ],
      exclude: path.resolve( 'node_modules' )
    }, {
      test: /\.styl(us)?$/,
      loader: 'stylus-loader',
    }, {
      test: /\.pug$/,
      loader: 'pug-loader'
    } ]
  },
  plugins: [ new HtmlWebpackPlugin( {
    template: path.resolve( 'src', 'views', 'index.pug' ),
    filename: process.env.NODE_ENV === 'production' ? path.resolve( 'views', 'index.html' ) : undefined,
  } ), new SourceMapDevToolPlugin() ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.json', '.js', '.jsx' ],
    alias
  },
  devServer: {
    historyApiFallback: true,
  }
}

export = config
