import dayjs from "dayjs";
import math from "../../utils/math/math";

function DayOfWeek(rows, tag = null) {
  let dow = {
    mon: {
      count: 0,
      values: [],
    },
    tue: {
      count: 0,
      values: [],
    },
    wed: {
      count: 0,
      values: [],
    },
    thu: {
      count: 0,
      values: [],
    },
    fri: {
      count: 0,
      values: [],
    },
    sat: {
      count: 0,
      values: [],
    },
    sun: {
      count: 0,
      values: [],
    },
  };

  rows.forEach((row) => {
    let day = dayjs(row.end).format("ddd").toLowerCase();
    let thisDow = dow[day];
    if (thisDow) {
      thisDow.count++;
      thisDow.values.push(tag ? row.getTrackerValue(tag) : 1);
    }
  });

  let counts = Object.keys(dow).map((t) => dow[t].count);
  let countPercentages = math.percentile(counts);

  Object.keys(dow).forEach((key, index) => {
    dow[key].percent = countPercentages[index];
  });

  return dow;
}

export default DayOfWeek;
