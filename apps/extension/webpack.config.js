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

const buildTypes = {
  production: {
    type: 'production',
    defaultEnvFile: '.env.production',
    compassEnvFile: '.env.production.compass',
    outDirPath: 'builds',
    manifestData: {
      leap: {
        name: 'Leap Cosmos Wallet',
        description: 'A crypto wallet for Cosmos blockchains.',
      },
      compass: {
        name: 'Compass Wallet for Sei',
        description: 'A crypto wallet for Sei Blockchain, brought to you by the Leap Wallet team.',
      },
    },
  },
  staging: {
    type: 'staging',
    defaultEnvFile: '.env.production',
    compassEnvFile: '.env.production.compass',
    outDirPath: 'staging',
    manifestData: {
      leap: {
        name: 'Leap Cosmos Wallet',
        description: 'A crypto wallet for Cosmos blockchains.',
      },
      compass: {
        name: 'Compass Wallet for Sei',
        description: 'A crypto wallet for Sei Blockchain, brought to you by the Leap Wallet team.',
      },
    },
  },
  canary: {
    type: 'canary',
    defaultEnvFile: '.env.canary',
    compassEnvFile: '.env.canary.compass',
    outDirPath: 'canary-builds',
    manifestData: {
      leap: {
        name: 'Leap Cosmos Wallet CANARY BUILD',
        description:
          'THIS IS THE CANARY DISTRIBUTION OF THE LEAP COSMOS  EXTENSION, INTENDED FOR DEVELOPERS.',
      },
      compass: {
        name: 'Compass CANARY BUILD',
        description:
          'THIS IS THE CANARY DISTRIBUTION OF THE COMPASS EXTENSION, INTENDED FOR DEVELOPERS.',
      },
    },
  },
  development: {
    type: 'development',
    defaultEnvFile: '.env.development',
    compassEnvFile: '.env.development.compass',
    manifestData: {
      leap: {
        name: 'Leap Cosmos Wallet DEVELOPMENT BUILD',
        description:
          'THIS IS THE DEVELOPMENT DISTRIBUTION OF THE LEAP COSMOS  EXTENSION, INTENDED FOR LOCAL DEVELOPMENT.',
      },
      compass: {
        name: 'Compass DEVELOPMENT BUILD',
        description:
          'THIS IS THE DEVELOPMENT DISTRIBUTION OF THE COMPASS EXTENSION, INTENDED FOR LOCAL DEVELOPMENT.',
      },
    },
  },
}

const buildType = buildTypes[process.env.NODE_ENV]
const isProdBuild = buildType.type === 'production'
const isStagingBuild = buildType.type === 'staging'
const isCanaryBuild = buildType.type === 'canary'
const isDevelopmentBuild = buildType.type === 'development'
const isCompassBuild = process.env.APP && process.env.APP.includes('compass')

const defaultEnvFileName = buildType.defaultEnvFile

const compassEnvFileName = buildType.compassEnvFile

let publicDir = isCompassBuild ? 'public/compass' : 'public/leap-cosmos'

if (isCanaryBuild && isCompassBuild) {
  publicDir = 'public/compass-canary'
}

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
        exclude: /node_modules\/(?!@injectivelabs)/,
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
      template: `./${publicDir}/index.html`,
      filename: 'index.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      template: `./${publicDir}/sidepanel.html`,
      filename: 'sidepanel.html',
      chunks: ['index'],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: publicDir,
          to: '.',
          filter: (filepath) =>
            !filepath.endsWith('index.html') && !filepath.endsWith('sidepanel.html'),
        },
        {
          from: 'public/hcaptcha.js',
          to: '.',
        },
        {
          from: 'public/recaptcha.js',
          to: '.',
        },
        {
          from: 'public/recaptcha-loader.js',
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
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('url'),
      vm: false,
    },
  },
}

module.exports = (env, argv) => {
  /**
   * @type {import('webpack').Configuration}
   */
  let config

  const staging = env?.staging === 'true'
  const canary = env?.canary === 'true'

  const baseManifest = fs.readFileSync(path.join(__dirname, 'public/base_manifest.json'), 'utf-8')

  // Set values based on the --env.name flag provided in the build command
  let name, description

  if (isCompassBuild) {
    name = buildType.manifestData.compass.name
    description = buildType.manifestData.compass.description
  } else {
    name = buildType.manifestData.leap.name
    description = buildType.manifestData.leap.description
  }

  const manifest = baseManifest.replace('__NAME__', name).replace('__DESCRIPTION__', description)
  const manifestObj = JSON.parse(manifest)
  // Write manifest file
  fs.writeFileSync(path.join(__dirname, `./${publicDir}/manifest.json`), manifest)

  if (isStagingBuild) {

    config = Object.assign({}, base_config, {
      mode: 'production',
      output: {
        path: path.join(
          __dirname,
          isCompassBuild ? 'staging-builds/compass-build' : 'staging-builds/cosmos-build',
        ),
        filename: '[name].js',
        clean: true,
      },
      plugins: [
        ...base_config.plugins,
        new Dotenv({
          path: appEnvFilePath,
          defaults: defaultEnvFilePath,
        }),
        new webpack.DefinePlugin({
          'process.env.buildType': JSON.stringify('staging')
        })
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
    if (isDevelopmentBuild) {
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
          new webpack.DefinePlugin({
            'process.env.buildType': JSON.stringify('development')
          })
        ],
      })
    } else if (isProdBuild || isCanaryBuild) {
      config = Object.assign({}, base_config, {
        mode: 'production',
        output: {
          path: path.join(
            __dirname,
            isCompassBuild
              ? `${buildType.outDirPath}/compass-build`
              : `${buildType.outDirPath}/cosmos-build`,
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
          new webpack.DefinePlugin({
            'process.env.buildType': isCanaryBuild ? JSON.stringify('canary') : JSON.stringify('production')
          }),
          //this is used to upload source maps to sentry
          new SentryWebpackPlugin({
            org: appEnvConfig.SENTRY_ORG,
            project: appEnvConfig.SENTRY_PROJECT,
            include: isCompassBuild
              ? `./${buildType.outDirPath}/compass-build`
              : `./${buildType.outDirPath}/cosmos-build`,
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
