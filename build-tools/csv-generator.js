const dayjs = require("dayjs");
const fs = require("fs");
const _ = require("lodash");

let daycount = 60;
let tag = "mood";

let rows = [["date", "note"]];

let start = dayjs().subtract(daycount, "day");
for (var i = 0; i < daycount; i++) {
  let d = start.add(i, "day");

  rows.push([d.hour(_.random(1, 23)).minute(_.random(1, 23)).toJSON(), `#${tag}(${i + 1})`]);
}

let csv = rows
  .map((row) => {
    return row.join(",");
  })
  .join("\n");

fs.writeFileSync("./artifacts/generated.csv", csv, "UTF-8");
