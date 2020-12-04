import time from "../time/time";

export default {
  num: {
    singular: "Count",
    plural: "Count",
    symbol: "count",
    type: "general",
  },
  steps: {
    singular: "Step",
    plural: "Steps",
    symbol: "steps",
    type: "general",
  },
  reps: {
    singular: "Rep",
    plural: "Reps",
    symbol: "reps",
    type: "general",
  },
  percent: {
    singular: "Percent",
    plural: "Percent",
    symbol: "%",
    type: "general",
    symbolAffix: "post",
  },
  pages: {
    singular: "Page",
    plural: "Pages",
    symbol: "pgs",
    type: "general",
  },
  tabs: {
    singular: "Tab",
    plural: "Tabs",
    symbol: "tbs",
    type: "health",
  },
  calorie: {
    singular: "Calorie",
    plural: "Calories",
    symbol: "cal",
    type: "health",
  },
  kcal: {
    singular: "Kilocalorie",
    plural: "Kilocalories",
    symbol: "kcal",
    type: "health",
  },
  capsules: {
    singular: "Capsule",
    plural: "Capsules",
    symbol: "caps",
    type: "health",
  },
  bpm: {
    singular: "Beat Per Minute",
    plural: "Beat Per Minute",
    symbol: "bpm",
    type: "health",
  },
  pain: {
    singular: "Pain",
    plural: "Pain",
    symbol: "pn",
    type: "health",
  },
  iu: {
    singular: "International Unit",
    plural: "International Units",
    symbolAffix: "post",
    symbol: "IU",
    type: "general",
  },
  dollars: {
    singular: "Dollar",
    plural: "Dollars",
    symbol: "$",
    type: "currency",
    symbolAffix: "pre",
    display: function (v) {
      return "$" + v.toFixed(2);
    },
  },
  peso: {
    singular: "Peso",
    plural: "Peso",
    symbol: "$",
    type: "currency",
    symbolAffix: "pre",
    display: function (v) {
      return "$" + v.toFixed(2);
    },
  },
  franc: {
    singular: "Franc",
    plural: "Francs",
    symbol: "Fr.",
    type: "currency",
    symbolAffix: "pre",
    display: function (v) {
      return "Fr. " + v.toFixed(2);
    },
  },
  cpound: {
    singular: "Pound",
    plural: "Pounds",
    symbol: "£",
    type: "currency",
    symbolAffix: "pre",
    display: function (v) {
      return "£" + v.toFixed(2);
    },
  },
  rupee: {
    singular: "Rupee",
    plural: "Rupees",
    symbol: "Rs.",
    type: "currency",
    symbolAffix: "pre",
    display: function (v) {
      return "Rs. " + v.toFixed(2);
    },
  },
  yen: {
    singular: "Yen",
    plural: "Yen",
    symbol: "¥",
    type: "currency",
    symbolAffix: "pre",
    display: function (v) {
      return "¥" + v.toFixed(2);
    },
  },
  yuan: {
    singular: "Yuan",
    plural: "Yuan",
    symbol: "¥",
    type: "currency",
    symbolAffix: "pre",
    display: function (v) {
      return "¥" + v.toFixed(2);
    },
  },
  euro: {
    singular: "Euro",
    plural: "Euros",
    symbol: "€",
    type: "currency",
    symbolAffix: "pre",
    display: function (v) {
      return "€" + v.toFixed(2);
    },
  },
  timer: {
    singular: "Time",
    plural: "Time",
    symbol: "time",
    type: "Timer",
    symbolAffix: "post",
    symbolSpace: false,
    display: function (v) {
      var sec_num = parseInt(v, 10); // don't forget the second param
      var hours = Math.floor(sec_num / 3600);
      var minutes = Math.floor((sec_num - hours * 3600) / 60);
      var seconds = sec_num - hours * 3600 - minutes * 60;
      return !hours ? minutes + "m " + seconds + "s" : hours + "h " + minutes + "m";
    },
  },
  sec: {
    singular: "Second",
    plural: "Seconds",
    symbol: "secs",
    type: "time",
    symbolAffix: "post",
    symbolSpace: true,
    display: function (v) {
      return time.secondsToTime(v);
    },
  },
  min: {
    singular: "Minute",
    plural: "Minutes",
    symbol: "m",
    type: "time",
    symbolAffix: "post",
    symbolSpace: false,
    display: function (v) {
      return time.secondsToTime(v * 60);
    },
  },
  hour: {
    singular: "Hour",
    plural: "Hours",
    symbol: "hrs",
    type: "time",
    symbolAffix: "post",
    symbolSpace: false,
    display: function (v) {
      return time.secondsToTime(v * 60 * 60);
    },
  },
  day: {
    singular: "Day",
    plural: "Days",
    symbol: "days",
    type: "time",
  },
  mm: {
    singular: "Millimeter",
    plural: "Millimeters",
    symbol: "mm",
    type: "distance",
  },
  cm: {
    singular: "Centimeter",
    plural: "Centimeters",
    symbol: "cm",
    type: "distance",
    symbolAffix: "post",
    symbolSpace: true,
  },
  meter: {
    singular: "Meter",
    plural: "Meter",
    symbol: "m",
    type: "distance",
    symbolAffix: "post",
    symbolSpace: true,
  },
  km: {
    singular: "Kilometer",
    plural: "Kilometers",
    symbol: "km",
    type: "distance",
    symbolAffix: "post",
    symbolSpace: true,
  },
  inch: {
    singular: "Inch",
    plural: "Inches",
    symbol: "in",
    type: "distance",
    symbolAffix: "post",
    symbolSpace: true,
  },
  degrees: {
    singular: "Degree",
    plural: "Degrees",
    symbol: "°",
    type: "temperature",
    symbolAffix: "post",
    symbolSpace: false,
  },
  kelvin: {
    singular: "Kelvin",
    plural: "Kelvin",
    symbol: "K",
    type: "temperature",
    symbolAffix: "post",
    symbolSpace: false,
  },
  celsius: {
    singular: "Celsius",
    plural: "Celsius",
    symbol: "°C",
    type: "temperature",
    symbolAffix: "post",
    symbolSpace: false,
  },
  fahrenheit: {
    singular: "Fahrenheit",
    plural: "Fahrenheit",
    symbol: "°F",
    type: "temperature",
    symbolAffix: "post",
    symbolSpace: false,
  },
  foot: {
    singular: "Foot",
    plural: "Feet",
    symbol: "ft",
    type: "distance",
    symbolAffix: "post",
    symbolSpace: true,
  },
  yard: {
    singular: "Yard",
    plural: "Yards",
    symbol: "yrds",
    type: "distance",
    symbolAffix: "post",
    symbolSpace: true,
  },
  mile: {
    singular: "Mile",
    plural: "Miles",
    symbol: "mi",
    type: "distance",
    symbolAffix: "post",
  },
  mcg: {
    singular: "Microgram",
    plural: "Micrograms",
    symbol: "mcg",
    type: "weight",
    symbolAffix: "post",
  },
  mg: {
    singular: "Milligram",
    plural: "Milligrams",
    symbol: "mg",
    type: "weight",
    symbolAffix: "post",
  },
  gram: {
    singular: "Gram",
    plural: "Grams",
    symbol: "g",
    type: "weight",
    symbolAffix: "post",
  },
  kg: {
    singular: "Kilogram",
    plural: "Kilograms",
    symbol: "kg",
    type: "weight",
    symbolAffix: "post",
  },
  stone: {
    singular: "Stone",
    plural: "Stones",
    symbol: "st",
    type: "weight",
  },
  oz: {
    singular: "Ounce",
    plural: "Ounces",
    symbol: "oz",
    type: "weight",
    symbolAffix: "post",
    symbolSpace: true,
  },
  pound: {
    singular: "Pound",
    plural: "Pounds",
    symbol: "lbs",
    type: "weight",
    symbolAffix: "post",
    symbolSpace: true,
  },
  cup: {
    singular: "Cup",
    plural: "Cups",
    symbol: "cups",
    type: "volume",
    symbolAffix: "post",
    symbolSpace: true,
  },
  deciliter: {
    singular: "Deciliter",
    plural: "Deciliters",
    symbol: "dL",
    type: "volume",
  },
  mdgl: {
    singular: "Blood Sugar",
    plural: "Blood Sugar",
    symbol: "mg/dl",
    type: "health",
    symbolAffix: "post",
    symbolSpace: true,
  },
  fluidounce: {
    singular: "Fluid Ounce",
    plural: "Fluid Ounces",
    symbol: "oz",
    type: "volume",
    symbolAffix: "post",
    symbolSpace: true,
  },
  pint: {
    singular: "Pint",
    plural: "Pints",
    symbol: "pint",
    type: "volume",
  },
  quart: {
    singular: "Quart",
    plural: "Quarts",
    symbol: "qt",
    type: "volume",
    symbolAffix: "post",
  },
  gallon: {
    singular: "Gallon",
    plural: "Gallons",
    symbol: "gal",
    type: "volume",
    symbolAffix: "post",
    symbolSpace: true,
  },
  liter: {
    singular: "Liter",
    plural: "Liters",
    symbol: "L",
    type: "volume",
    symbolAffix: "post",
    symbolSpace: false,
  },
  milliliter: {
    singular: "Milliliter",
    plural: "Milliliters",
    symbol: "ml",
    type: "volume",
    symbolAffix: "post",
    symbolSpace: false,
  },
  // bees: {
  //   singular: "Bee",
  //   plural: "Bees",
  //   symbol: "bz",
  //   type: "random",
  // },
  // twinkies: {
  //   singular: "Twinkie",
  //   plural: "Twinkies",
  //   symbol: "twnk",
  //   type: "random",
  // },
};
