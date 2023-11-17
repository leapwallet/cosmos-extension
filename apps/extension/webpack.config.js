const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const { DeleteSourceMapsPlugin } = require('webpack-delete-sourcemaps-plugin')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const fs = require('fs')

const defaultEnvFileName =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'

const compassEnvFileName =
  process.env.NODE_ENV === 'production' ? '.env.production.compass' : '.env.development.compass'

const isProdBuild = process.env.NODE_ENV === 'production'
const isCompassBuild = process.env.APP === 'compass'

const defaultEnvFilePath = path.join(__dirname, defaultEnvFileName)
const appEnvFilePath = path.join(
  __dirname,
  isCompassBuild ? compassEnvFileName : defaultEnvFileName,
)

const { parsed: envConfig } = require('dotenv').config({
  path: defaultEnvFilePath,
})

const { parsed: appEnvConfig } = require('dotenv').config({
  path: appEnvFilePath,
})

if (!envConfig) {
  throw new Error(`Missing env file ${defaultEnvFilePath} file`)
}

if (isCompassBuild) {
  envConfig['APP'] = 'compass'
}

/**
 * @type {import('webpack').Configuration}
 */
const base_config = {
  entry: {
    index: './src/index.tsx',
    background: './src/extension-scripts/background.ts',
    contentScripts: ['./src/content-scripts/content-scripts.ts'],
    injectLeap: ['./src/content-scripts/inject-leap.ts'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'jsx',
          target: 'es2020',
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'tsx',
          target: 'es2020',
        },
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'esbuild-loader',
            options: {
              loader: 'css',
              minify: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: isCompassBuild ? './public/compass/index.html' : './public/leap-cosmos/index.html',
      chunks: ['index'],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: isCompassBuild ? 'public/compass' : 'public/leap-cosmos',
          to: '.',
          filter: (filepath) => !filepath.endsWith('index.html'),
        },
        {
          from: 'public/hcaptcha.js',
          to: '.',
        },
      ],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({})],
    fallback: {
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      assert: require.resolve('assert'),
      http: false,
      https: false,
      url: require.resolve('url'),
    },
  },
}

module.exports = (env, argv) => {
  /**
   * @type {import('webpack').Configuration}
   */
  let config

  const staging = env?.staging === 'true'

  const baseManifest = fs.readFileSync(path.join(__dirname, 'public/base_manifest.json'), 'utf-8')

  // Set values based on the --env.name flag provided in the build command
  let name, description, publicPath
  if (isCompassBuild) {
    name = 'Compass Wallet for Sei'
    description = 'A crypto wallet for Sei Blockchain, brought to you by the Leap Wallet team.'
    publicPath = 'public/compass'
  } else {
    name = 'Leap Cosmos Wallet'
    description = 'A crypto wallet for Cosmos blockchains.'
    publicPath = 'public/leap-cosmos'
  }

  const manifest = baseManifest.replace('__NAME__', name).replace('__DESCRIPTION__', description)
  const manifestObj = JSON.parse(manifest)
  // Write manifest file
  fs.writeFileSync(path.join(__dirname, `${publicPath}/manifest.json`), manifest)

  if (staging) {
    config = Object.assign({}, base_config, {
      mode: 'production',
      output: {
        path: path.join(__dirname, isCompassBuild ? 'builds/compass-build' : 'builds/cosmos-build'),
        filename: '[name].js',
        clean: true,
      },
      devtool: 'source-map',
      plugins: [
        ...base_config.plugins,
        new Dotenv({
          path: `./.env.development`,
        }),
      ],
      optimization: {
        usedExports: true,
        minimizer: [
          new ESBuildMinifyPlugin({
            target: 'es2020',
          }),
        ],
      },
    })
  } else {
    if (!isProdBuild) {
      config = Object.assign({}, base_config, {
        mode: 'development',
        devtool: 'inline-source-map',
        watch: true,
        output: {
          path: path.join(__dirname, 'dist'),
          filename: '[name].js',
        },
        plugins: [
          ...base_config.plugins,
          new Dotenv({
            path: appEnvFilePath,
            defaults: defaultEnvFilePath,
          }),
        ],
      })
    } else if (isProdBuild) {
      config = Object.assign({}, base_config, {
        mode: 'production',
        output: {
          path: path.join(
            __dirname,
            isCompassBuild ? 'builds/compass-build' : 'builds/cosmos-build',
          ),
          filename: '[name].js',
          clean: true,
        },
        devtool: 'hidden-source-map',
        plugins: [
          ...base_config.plugins,
          new Dotenv({
            path: appEnvFilePath,
            defaults: defaultEnvFilePath,
          }),
          //this is used to upload source maps to sentry
          new SentryWebpackPlugin({
            org: appEnvConfig.SENTRY_ORG,
            project: appEnvConfig.SENTRY_PROJECT,
            include: isCompassBuild ? './builds/compass-build' : './builds/cosmos-build',
            // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
            // and needs the `project:releases` and `org:read` scopes
            token: envConfig.SENTRY_AUTH_TOKEN,
            release: manifestObj.version,
            deleteAfterCompile: true,
            url: envConfig.SENTRY_HOST,
          }),
          new DeleteSourceMapsPlugin(),
        ],
        optimization: {
          usedExports: true,
          minimizer: [
            new ESBuildMinifyPlugin({
              target: 'es2020',
            }),
          ],
        },
      })
    }
  }

  return config
}
