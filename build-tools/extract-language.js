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
  if (content.Lang) {
    delete content.Lang;
  }
  return `export default {
    name: "base",
    author: "Brandon",
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

function scrubWrappingQuotes(str) {
  str = str.trim();
  if (["`", `"`, `'`].indexOf(str.substr(0, 1)) > -1) {
    str = str.substring(1);
  }
  if (["`", `"`, `'`].indexOf(str.substr(str.length - 1, 1)) > -1) {
    str = str.substr(0, str.length - 1);
  }
  return str;
}

function stringsToObject(strArray, filler) {
  let obj = {};
  strArray
    .filter((str) => str)
    .forEach((str) => {
      let split = str.split(" ");
      let name = split[0].replace(",", "");
      let value = null;
      // console.log({ name, value });
      if (split.length > 1) {
        value = scrubWrappingQuotes(split.join(" ").replace(split[0], "").trim());
      }

      if (!`${value}`.trim().length) {
        value = null;
      }

      let nameSplit = name.split(".");
      let sectionKey = nameSplit[0];
      let partKey = nameSplit[1];

      obj[sectionKey] = obj[sectionKey] || {};

      if (filler) {
        obj[sectionKey][partKey] = filler;
      } else {
        obj[sectionKey][partKey] = obj[sectionKey][partKey] || value;
      }

      // nameSplit.forEach((nm, index) => {
      //   if (index == 0) {
      //     obj[nm] = obj[nm] || {};
      //   } else if (index == 1) {
      //     let sectionKey = nameSplit[index - 1];
      //     console.log({ sectionKey });
      //     obj[sectionKey][nm] = filler || value;
      //   }
      // });
    });
  return obj;
}
// Build test one
main("fake", undefined, true);
// // Generate Tester Lang
main("fake", "TEST", false);
// // Generate Base
main("base", undefined, false);
