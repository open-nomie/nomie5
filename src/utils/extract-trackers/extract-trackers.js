import math from "../math/math";
import time from "../time/time";
import regexs from "../regex";
import Log from "../log/log";
const log = new Log("utils/extract-trackers");
export default function (text) {
  // Get all trackers from the text
  // Including #this and #this(123)
  // let trackers = text.match(/(#[a-z0-9_]+\((.+?\))|#[a-z0-9_]+)/gi) || [];
  let trackers = text.match(new RegExp(regexs.tag, "gi")) || [];
  // Create a Map for easy following
  let map = {};
  // Loop over each of the trackers found

  trackers.map((tracker) => {
    // Remove a trailing . - if it exists.
    // Why would this exist? Becdause I can't get the regex to stop at a period, and also allow #tracker(1.3) values
    let punct = [".", "?", ",", "!", ":", "$", "%", "^", "&"];
    if (punct.indexOf(tracker.substr(tracker.length - 1, 1)) > -1) {
      tracker = tracker.substr(0, tracker.length - 1);
    }
    // Reaplace and # or )
    tracker = tracker.replace(/(\#|\))/gi, "");
    // Split it on (  to see if it's a value based tracker
    let trackerArr = tracker.split("(");
    // Get name from TrackerArr - even if its not a value based, it will be at 0 index
    let trackerName = trackerArr[0].replace("#", "").replace("\n", "").toLowerCase();
    // Default the value to 1
    let value = 1;
    // It's trackerArr is more than 1, its a value based
    if (trackerArr.length > 1) {
      // Get the value from the 2nd part *asdfasdf* of the #key(asdfasdf)
      let raw = trackerArr[1].trim();
      let timeStringCheck = raw.match(/\d{2}:\d{2}:\d{2}/);
      // Lets make sure there's no time in here 00:44:33..
      if (timeStringCheck) {
        // it's a time string - convert it to seconds;
        value = time.timestringToSeconds(timeStringCheck[0]);
      } else {
        value = parseFloat(raw.replace(/([a-zA-Z ])/g, ""));
      }
    }
    // Add this to the map
    map[trackerName] = map[trackerName] || {
      tracker: trackerName,
      values: [],
    };
    // Push the Value to this tracker names values
    map[trackerName].values.push(value);
  });

  // Lets get a final array ready
  let final = {};
  // Loop over the Map's keys (tracker names)
  for (var i in map) {
    // only save those that aren't standard
    map[i].value = math.sum(map[i].values);
    final[i] = {
      tracker: map[i].tracker,
      value: isNaN(map[i].value) ? 0 : map[i].value,
    };
  }

  return final;
}
