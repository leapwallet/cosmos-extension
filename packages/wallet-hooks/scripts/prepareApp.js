const fs = require('fs');
const openClosedMap = require('./openClosedMap');
const isOpenSource = process.env.IS_OPEN_SOURCE == 'true';
const packageJson = require('../package.json');
let connectorString = '';

if (isOpenSource) {
  Object.keys(openClosedMap).map((package) => {
    const singlePackage = openClosedMap[package];
    delete packageJson.dependencies[singlePackage.name];
    packageJson.dependencies[package] = singlePackage.openSourcedVersion;
    connectorString = `${connectorString}export * from "${package}";\n`;
  });
} else {
  // Replace import of opensource import to closed source one
  Object.keys(openClosedMap).map((package) => {
    const singlePackage = openClosedMap[package];
    delete packageJson.dependencies[package];
    packageJson.dependencies[singlePackage.name] = singlePackage.version;
    connectorString = `${connectorString}export * from '${singlePackage.name}';\n`;
  });
}

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
fs.writeFileSync('./src/connectors/index.ts', connectorString);
