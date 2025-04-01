import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { ProvidePlugin } from '@rspack/core'
import { sentryWebpackPlugin } from '@sentry/webpack-plugin'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

const buildTypes = {
  production: {
    type: 'production',
    defaultEnvFile: '.env.production',
    publicDir: 'public/compass',
    outDirPath: 'builds/compass',
    manifestData: {
      name: 'Compass Wallet for Sei',
      description: 'A crypto wallet for Sei Blockchain, brought to you by the Leap Wallet team.',
    },
  },
  staging: {
    type: 'staging',
    defaultEnvFile: '.env.production',
    publicDir: 'public/compass',
    outDirPath: 'builds/staging',
    manifestData: {
      name: 'Compass Wallet for Sei',
      description: 'A crypto wallet for Sei Blockchain, brought to you by the Leap Wallet team.',
    },
  },
  canary: {
    type: 'canary',
    defaultEnvFile: '.env.canary',
    publicDir: 'public/canary',
    outDirPath: 'builds/canary',
    manifestData: {
      name: 'Compass CANARY BUILD',
      description:
        'THIS IS THE CANARY DISTRIBUTION OF THE COMPASS EXTENSION, INTENDED FOR DEVELOPERS.',
    },
  },
  development: {
    type: 'development',
    defaultEnvFile: '.env.development',
    publicDir: 'public/compass',
    outDirPath: 'builds/development',
    manifestData: {
      name: 'Compass DEVELOPMENT BUILD',
      description:
        'THIS IS THE DEVELOPMENT DISTRIBUTION OF THE COMPASS EXTENSION, INTENDED FOR LOCAL DEVELOPMENT.',
    },
  },
} as const

const buildType = buildTypes[(process.env.NODE_ENV ?? 'development') as keyof typeof buildTypes]

const isProdBuild = buildType.type === 'production'
const isDevelopmentBuild = buildType.type === 'development'

const defaultEnvFileName = buildType.defaultEnvFile

const defaultEnvFilePath = path.join(__dirname, defaultEnvFileName)

const publicDir = buildType.publicDir
const buildDir = buildType.outDirPath

const { parsed: defaultEnvConfig = {} } = dotenv.config({
  path: defaultEnvFilePath,
})

defaultEnvConfig['APP'] = 'compass'

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

export default defineConfig({
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
        new ProvidePlugin({
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
                url: defaultEnvConfig.SENTRY_HOST,
              }),
            ]
          : []),
      ],
    },
  },
})
