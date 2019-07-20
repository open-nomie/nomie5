const fs = require('fs');
// Read Public and Package file
let public = fs.readFileSync('./public/index.html', 'UTF-8');
let packageJSON = JSON.parse(fs.readFileSync('./package.json', 'UTF-8'));
// Replace app version with app version
public = public.replace(/APP_VERSION/g, packageJSON.version.substr(0, 10)); // substr to limit any fuckery

fs.writeFileSync('./public/index.html', public, 'UTF-8');
