let packageJson = require("../package.json");
let semver = require("semver");
let fs = require("fs");
// Get type
const args = process.argv.slice(2);
let type = args[0] || "patch";
// Update Version in Package
packageJson.version = semver.inc(packageJson.version, type);
// Write package
fs.writeFileSync(
  "./package.json",
  JSON.stringify(packageJson, null, 2),
  "UTF-8"
);
// Set Version for other things
let versionFile = { version: packageJson.version };
fs.writeFileSync("./public/version.json", JSON.stringify(versionFile, null, 2));
// Done
console.log(`New Version: ${packageJson.version}`);
