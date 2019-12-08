let copy = require("copy");
let move = [
  { src: "node_modules/leaflet/dist/**/*", dest: "public/vendors/leaflet" },
  {
    src: "node_modules/pouchdb/dist/**/*",
    dest: "public/vendors/pouchdb"
  },
  {
    src: "node_modules/blockstack/dist/**/*",
    dest: "public/vendors/blockstack"
  },
  {
    src: "node_modules/esri-leaflet/dist/**/*",
    dest: "public/vendors/leaflet/esri"
  },
  {
    src: "node_modules/esri-leaflet-geocoder/dist/**/*",
    dest: "public/vendors/leaflet/geocoder"
  },
  {
    src: "node_modules/material-design-iconic-font/dist/**/*",
    dest: "public/vendors/material-design-iconic-font"
  }
];

let copyp = (to, from) => {
  return new Promise((resolve, reject) => {
    copy(to, from, (err, files) => {
      if (!err) {
        resolve(files);
      } else {
        reject(err);
      }
    });
  });
};

move.forEach(async transport => {
  await copyp(transport.src, transport.dest);
});
