const { defineConfig } = require('@rsbuild/core')
const { pluginReact } = require('@rsbuild/plugin-react')
const rspack = require('@rspack/core')
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin')
const path = require('path')
const fs = require('fs')

const buildTypes = {
  production: {
    type: 'production',
    defaultEnvFile: '.env.production',
    outDirPath: 'builds/cosmos',
    publicDir: 'public/leap-cosmos',
    manifestData: {
      name: 'Leap Cosmos Wallet',
      description: 'A crypto wallet for Cosmos blockchains.',
    },
  },
  staging: {
    type: 'staging',
    defaultEnvFile: '.env.production',
    outDirPath: 'builds/staging',
    publicDir: 'public/leap-cosmos',
    manifestData: {
      name: 'Leap Cosmos Wallet',
      description: 'A crypto wallet for Cosmos blockchains.',
    },
  },
  canary: {
    type: 'canary',
    defaultEnvFile: '.env.canary',
    outDirPath: 'builds/canary',
    publicDir: 'public/leap-cosmos',
    manifestData: {
      name: 'Leap Cosmos Wallet CANARY BUILD',
      description:
        'THIS IS THE CANARY DISTRIBUTION OF THE LEAP COSMOS EXTENSION, INTENDED FOR DEVELOPERS.',
    },
  },
  development: {
    type: 'development',
    defaultEnvFile: '.env.development',
    publicDir: 'public/leap-cosmos',
    outDirPath: 'builds/development',
    manifestData: {
      name: 'Leap Cosmos Wallet DEVELOPMENT BUILD',
      description:
        'THIS IS THE DEVELOPMENT DISTRIBUTION OF THE LEAP COSMOS EXTENSION, INTENDED FOR LOCAL DEVELOPMENT.',
    },
  },
}

const buildType = buildTypes[process.env.NODE_ENV]
const isProdBuild = buildType.type === 'production'
const isDevelopmentBuild = buildType.type === 'development'

const defaultEnvFileName = buildType.defaultEnvFile
const defaultEnvFilePath = path.join(__dirname, defaultEnvFileName)

const publicDir = buildType.publicDir
const buildDir = buildType.outDirPath

const { parsed: defaultEnvConfig } = require('dotenv').config({
  path: defaultEnvFilePath,
})

if (!defaultEnvConfig) {
  throw new Error(`Missing env file ${defaultEnvFilePath} file`)
}

const envVars = Object.entries(defaultEnvConfig).reduce((acc, [key, value]) => {
  return {
    ...acc,
    [`process.env.${key}`]: JSON.stringify(value),
    'process.env.buildType': JSON.stringify(buildType.type),
  }
}, {})

const baseManifest = fs.readFileSync(path.join(__dirname, 'public/base_manifest.json'), 'utf-8')
const { name, description } = buildType.manifestData
const manifest = baseManifest.replace('__NAME__', name).replace('__DESCRIPTION__', description)
const manifestObj = JSON.parse(manifest)
fs.writeFileSync(path.join(__dirname, `./${publicDir}/manifest.json`), manifest)

module.exports = defineConfig({
  dev: {
    client: {
      port: 3000,
      host: '0.0.0.0',
      protocol: 'ws',
    },
    writeToDisk: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    publicDir: {
      copyOnBuild: false,
    },
  },
  output: {
    filenameHash: false,
  },
  environments: {
    web: {
      plugins: [pluginReact()],
      source: {
        entry: {
          index: './src/index.tsx',
          sidePanel: './src/index.tsx',
        },
        define: {
          ...envVars,
        },
      },
      html: {
        template({ entryName }) {
          const templates = {
            index: `./${publicDir}/index.html`,
            sidePanel: `./${publicDir}/sidepanel.html`,
          }
          return templates[entryName] || `./${publicDir}/index.html`
        },
      },
      output: {
        target: 'web',
        distPath: {
          root: isDevelopmentBuild ? './dist' : buildDir,
          js: './',
          css: './',
          wasm: './',
        },
        copy: [
          {
            from: `./${publicDir}`,
            to: './',
            globOptions: {
              ignore: ['**/index.html', '**/sidepanel.html'],
            },
          },
          {
            from: `./public/hcaptcha.js`,
            to: './',
          },
          {
            from: `./public/recaptcha-loader.js`,
            to: './',
          },
          {
            from: `./public/recaptcha.js`,
            to: './',
          },
        ],
      },
    },
    webworker: {
      plugins: [pluginReact()],
      source: {
        entry: {
          background: './src/extension-scripts/background.ts',
          contentScripts: './src/content-scripts/content-scripts.ts',
          injectLeap: './src/content-scripts/inject-leap.ts',
        },
        define: {
          ...envVars,
        },
      },
      output: {
        distPath: {
          root: isDevelopmentBuild ? './dist' : buildDir,
          js: './',
          wasm: './',
        },
        target: 'web-worker',
      },
    },
  },

  performance: {
    buildCache: false,
  },
  tools: {
    rspack: {
      resolve: {
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
      module: {
        rules: [
          {
            test: /\.m?js$/,
            resolve: {
              fullySpecified: false,
            },
          },
        ],
      },
      plugins: [
        new rspack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
        ...(isProdBuild
          ? [
              sentryWebpackPlugin({
                org: defaultEnvConfig.SENTRY_ORG,
                project: defaultEnvConfig.SENTRY_PROJECT,
                sourcemaps: {
                  assets: path.resolve(__dirname, `./${buildDir}/**`),
                  filesToDeleteAfterUpload: ['**/*.map'],
                },
                authToken: defaultEnvConfig.SENTRY_AUTH_TOKEN,
                release: {
                  name: manifestObj.version,
                },
                deleteAfterCompile: true,
                url: defaultEnvConfig.SENTRY_HOST,
              }),
            ]
          : []),
      ],
    },
  },
})
