const { defineConfig } = require('@rsbuild/core');
const { pluginReact } = require('@rsbuild/plugin-react');
const rspack = require('@rspack/core');
const path = require('path');
const fs = require('fs');

const buildTypes = {
  production: {
    type: 'production',
    defaultEnvFile: '.env.production',
    compassEnvFile: '.env.production.compass',
    outDirPath: 'builds/cosmos-build',
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
    outDirPath: 'staging/cosmos-build',
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
    outDirPath: 'canary-builds/compass-canary',
    manifestData: {
      leap: {
        name: 'Leap Cosmos Wallet CANARY BUILD',
        description: 'THIS IS THE CANARY DISTRIBUTION OF THE LEAP COSMOS EXTENSION, INTENDED FOR DEVELOPERS.',
      },
      compass: {
        name: 'Compass CANARY BUILD',
        description: 'THIS IS THE CANARY DISTRIBUTION OF THE COMPASS EXTENSION, INTENDED FOR DEVELOPERS.',
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
        description: 'THIS IS THE DEVELOPMENT DISTRIBUTION OF THE LEAP COSMOS EXTENSION, INTENDED FOR LOCAL DEVELOPMENT.',
      },
      compass: {
        name: 'Compass DEVELOPMENT BUILD',
        description: 'THIS IS THE DEVELOPMENT DISTRIBUTION OF THE COMPASS EXTENSION, INTENDED FOR LOCAL DEVELOPMENT.',
      },
    },
  },
};

const buildType = buildTypes[process.env.NODE_ENV];
const isProdBuild = buildType.type === 'production';
const isStagingBuild = buildType.type === 'staging';
const isCanaryBuild = buildType.type === 'canary';
const isDevelopmentBuild = buildType.type === 'development';
const isCompassBuild = process.env.APP && process.env.APP.includes('compass');


const defaultEnvFileName = buildType.defaultEnvFile;
const compassEnvFileName = buildType.compassEnvFile;
let publicDir = isCompassBuild ? 'public/compass' : 'public/leap-cosmos';

if (isCanaryBuild && isCompassBuild) {
  publicDir = 'public/compass-canary';
}

const defaultEnvFilePath = path.join(__dirname, defaultEnvFileName);
const appEnvFilePath = path.join(
  __dirname,
  isCompassBuild ? compassEnvFileName : defaultEnvFileName,
);

let buildDir = isCompassBuild ? 'builds/compass-build' : 'builds/cosmos-build';
if (isStagingBuild) {
  buildDir = isCompassBuild ? 'staging-builds/compass-build' : 'staging-builds/cosmos-build';
}

const { parsed: defaultEnvConfig } = require('dotenv').config({
  path: defaultEnvFilePath,
});

const { parsed: appEnvConfig } = require('dotenv').config({
  path: appEnvFilePath,
});

if (!defaultEnvConfig) {
  throw new Error(`Missing env file ${defaultEnvFilePath} file`);
}

if (isCompassBuild) {
  defaultEnvConfig['APP'] = 'compass';
}

const envConfig = Object.assign(defaultEnvConfig, appEnvConfig);
const envVars = Object.entries(envConfig).reduce((acc, [key, value]) => {
  return {
    ...acc,
    [`process.env.${key}`]: JSON.stringify(value),
    'process.env.buildType': JSON.stringify(buildType.type)
  }
}, {})

const baseManifest = fs.readFileSync(path.join(__dirname, 'public/base_manifest.json'), 'utf-8');
const { name, description } = isCompassBuild
  ? buildType.manifestData.compass
  : buildType.manifestData.leap;
const manifest = baseManifest.replace('__NAME__', name).replace('__DESCRIPTION__', description);
const manifestObj = JSON.parse(manifest);
fs.writeFileSync(path.join(__dirname, `./${publicDir}/manifest.json`), manifest);

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
        }
      },
      html: {
        template({ entryName }) {
          const templates = {
            index: `./${publicDir}/index.html`,
            sidePanel: `./${publicDir}/sidepanel.html`,
          }
          return templates[entryName] || `./${publicDir}/index.html`
        }
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
        }
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
      ],
    },
  },
});
