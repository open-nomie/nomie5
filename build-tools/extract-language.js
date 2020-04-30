const findInFiles = require("find-in-files");

let strings = [];
async function main() {
  let files = await findInFiles.find(/Lang.t(.*?)\)/, "./src/", ".svelte$");
  //   console.log("Files", files);

  Object.keys(files).forEach((file) => {
    let matches = files[file].matches;
    matches = matches.map((str) => {
      str = str
        .replace(/Lang.t\((\'|\")/, "")
        .replace(")", "")
        .replace(/("|'|\)|\()/, "");
      return str;
    });
    strings = [...strings, ...matches];
  });

  console.log(stringsToObject(strings));
  //   console.log("strings", strings);
}

function stringsToObject(strArray) {
  let obj = {};
  console.log("Str Array", strArray);
  strArray
    .filter((str) => str)
    .forEach((str) => {
      let split = str.split(" ");
      console.log("Splot", split);
      let name = split[0].replace(",", "");
      let value = null;
      console.log({ name, value });
      if (split.length > 1) {
        value = split[1];
      }
      let nameSplit = name.split(".");
      nameSplit.forEach((name, index) => {
        if (index == 0) {
          obj[name] = obj[name] || {};
        } else if (index == 1) {
          obj[nameSplit[index - 1]][name] = value;
        }
      });
    });
  return obj;
}

main();
