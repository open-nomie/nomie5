let packageJson = require('../package.json');
let semver = require('semver');
let fs = require('fs');
packageJson.version = semver.inc(packageJson.version, 'patch');
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2), 'UTF-8');

let versionFile = { version: packageJson.version };
fs.writeFileSync('./public/version.json', JSON.stringify(versionFile, null, 2));

console.log(`Nomie Version is now set to: ${packageJson.version}`);
