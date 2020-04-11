import { LedgerStore } from "../../store/ledger";
import { TrackerStore } from "../../store/trackers";
import Tracker from "../../modules/tracker/tracker";
import dayjs from "dayjs";
import md5 from "md5";
import download from "../download/download";

export default class CSV {
  constructor() {}

  logsToCSV(logs, trackersToInclude) {
    let header = ["epoch", "start", "end", "tracker", "value", "note", "lat", "lng", "location", "score"];
    let rows = [header];
    // Get an array of tag names from the trackers
    let tagsToInclude = trackersToInclude.map((tracker) => tracker.tag);
    // Loop over logs
    logs.forEach((log) => {
      // Extract log tracker tags
      let logTrackers = Object.keys(log.trackers);
      const tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
      const localStart = new Date(log.start - tzoffset).toISOString().slice(0, -1);
      const localEnd = new Date(log.end - tzoffset).toISOString().slice(0, -1);

      // Loop over tracker tags
      logTrackers.forEach((trackerTag) => {
        // Is it a match?
        if (tagsToInclude.indexOf(trackerTag) > -1) {
          // Include it..
          rows.push([
            log.end,
            localStart,
            localEnd,
            trackerTag,
            log.trackers[trackerTag].value,
            log.note.replace(/(\"|\,|\n|\r)/g, " "), // Remove csv breaking chars
            log.lat,
            log.lng,
            log.location.replace(/(\"|\,|\n|\r)/g, " "), // Remove csv breaking chars
            log.score,
          ]);
        }
      }); // end looping over logTrackers
      // TODO: Make this output notes
      if (!logTrackers.length) {
        rows.push([
          log.end,
          localStart,
          localEnd,
          "note",
          1,
          log.note.replace(/(\"|\,|\n|\r)/g, " "), // Remove csv breaking chars
          log.lat,
          log.lng,
          log.location.replace(/(\"|\,|\n|\r)/g, " "), // Remove csv breaking chars
          log.score,
        ]);
      }
    });
    return rows;
  }

  /**
   * Download a CSV file
   *
   * @param {String} filename
   * @param {Array} rows
   */
  // download(filename, rows) {
  //   let file = rows.join("\r\n");
  //   this.filename = filename || "nomie4.csv";

  //   if (navigator.msSaveBlob) {
  //     // IE 10+
  //     navigator.msSaveBlob(new Blob([file], { type: "text/csv;charset=utf-8;" }), filename);
  //   } else {
  //     let encodedUri = "data:text/csv;charset=UTF-8," + encodeURIComponent(file);
  //     let link = document.createElement("a");
  //     link.setAttribute("href", encodedUri);
  //     link.setAttribute("download", filename);
  //     document.body.appendChild(link); // Firefox
  //     link.click();
  //   }
  // }

  /**
   * Generate the CSV
   * generate({ start, end, [trackers] })
   *
   * @param {Object} options
   */
  async generate(options) {
    options = options || {};
    let start = options.start;
    let end = options.end;
    let trackers = options.trackers;

    // Loop over provided trackers - make them real trackers
    trackers.map((tracker) => {
      if (typeof tracker == "string") {
        return new Tracker({ tag: tracker });
      } else {
        return new Tracker(tracker);
      }
    });
    // Get the logs for the provided time period

    let logs = await LedgerStore.query({
      start: dayjs(start).startOf("day"),
      end: dayjs(end).endOf("day"),
      // end TODO: See why end date is not working in query
    });
    // Expand and filter the logs
    logs = logs.map((record) => {
      record.expand(); // get more data like trackers and values
      return record;
    });

    // generate CSV array
    let csvArray = this.logsToCSV(logs, trackers);
    let filename = `n-${dayjs(start).format("YYYY-MM-DD")}-${dayjs(end).format("YYYY-MM-DD")}.${md5(trackers).substr(
      0,
      5
    )}.APP_VERSION.csv`;
    download.csv(filename, csvArray.join("\r\n"));
    // this.download(filename, csvArray.join("\r\n"));
  }
}
