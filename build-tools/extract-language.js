const findInFiles = require("find-in-files");
const fs = require("fs");

let strings = [];

async function getBaseLang(filler) {
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

  return stringsToObject(strings, filler);
}

async function generateModule(content) {
  return `export default {
    translation: ${JSON.stringify(content, null, 2)}
  }`;
}

async function generate(filler) {
  const base = await getBaseLang(filler);
  fs.writeFileSync("./artifacts/lang.json", JSON.stringify(base, null, 2), "UTF-8");
  return await generateModule(base);
}

async function main(id, filler = undefined, test = false) {
  const module = await generate(filler);

  if (test) {
    fs.writeFileSync(`./artifacts/lang-${id}.ts`, module, "UTF-8");
  } else {
    fs.writeFileSync(`./src/lang/${id}.ts`, module, "UTF-8");
  }
  //   console.log("strings", strings);
}

function stringsToObject(strArray, filler) {
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
          obj[nameSplit[index - 1]][name] = filler || value;
        }
      });
    });
  return obj;
}

main("fake", "Test", false);
