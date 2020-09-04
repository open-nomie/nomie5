import math from "../math/math";
import uoms from "./uoms";
let NomieUOM = {
  uoms,
  toArray() {
    return Object.keys(NomieUOM.uoms).map((key) => {
      let obj = NomieUOM.uoms[key];
      obj.key = key;
      return obj;
    });
  },
  toGroupedArray() {
    let items = {};
    Object.keys(NomieUOM.uoms).forEach((key) => {
      let obj = NomieUOM.uoms[key];
      obj.key = key;
      items[obj.type] = items[obj.type] || [];
      items[obj.type].push(obj);
    });
    return items;
  },
  plural(key) {
    return NomieUOM.uoms.hasOwnProperty(key) ? NomieUOM.uoms[key].plural : key;
  },
  singular(key) {
    return NomieUOM.uoms.hasOwnProperty(key) ? NomieUOM.uoms[key].singular : key;
  },
  abv(key) {
    return NomieUOM.uoms.hasOwnProperty(key) ? NomieUOM.uoms[key].symbol : null;
  },
  format(value, key, includeUnit = true) {
    if (NomieUOM.uoms.hasOwnProperty(key) && !isNaN(value)) {
      let symbol = NomieUOM.uoms[key].symbol || null;
      let affix = NomieUOM.uoms[key].symbolAffix || null;
      let space = NomieUOM.uoms[key].symbolSpace || false ? " " : "";

      // Get display formatter for key if one exists.
      let displayFormatter = NomieUOM.uoms[key].display || null;

      // Does the UOM have it's own display formatter?
      if (displayFormatter) {
        return displayFormatter(value); // displayFormatter(v);
      } else {
        if (!isNaN(parseFloat(value)) && isFinite(value) && value !== 0) {
          value = NomieUOM.addCommas(value);
        }
        if (affix && symbol && includeUnit) {
          if (affix == "pre") {
            return symbol + space + value;
          } else {
            return value + space + symbol;
          }
        } else {
          return value;
        }
      } // end if the uom has it's own display
    } else {
      return value;
    }
  },
  addCommas(num) {
    num = `${num || 0}`;
    let x = num.split(".");
    let x1 = x[0];
    let x2 = x.length > 1 ? "." + x[1] : "";
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, "$1" + "," + "$2");
    }
    return x1 + x2;
  },
};

export default NomieUOM;
