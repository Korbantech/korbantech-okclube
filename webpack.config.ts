import path from 'path'
import Webpack from 'webpack'

const config: Webpack.Configuration = {
  entry: path.resolve( 'src', 'index.browser.tsx' ),
  output: {
    path: path.resolve( 'dist' )
  },
  module: {
    rules: [ {
      test: /\.[jt]sx?$/,
      loader: 'babel-loader'
    } ]
  },
  resolve: {
    extensions: [ '.ts', '.tsx', '.js', '.jsx', '.json' ]
  }
}

export default config
