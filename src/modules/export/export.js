// Modules
import Storage from "../storage/storage";
// stores
import config from "../../../config/global";
import { LedgerStore } from "../../store/ledger";
import { Locations } from "../../store/locations";

//vendors
import dayjs from "dayjs";

export default class Export {
  constructor(options) {
    options = options || {};
    this.listeners = [];
    this.format = options.format || "json";
    this.backup = {
      nomie: {
        number: "APP_VERSION",
        created: new Date().toJSON(),
        startDate: new Date().toJSON(),
        endDate: new Date().toJSON(),
      },
      boards: [],
      events: [],
      locations: [],
      trackers: {},
    };
  }

  start() {
    return new Promise((resolve, reject) => {
      this.fireChange("Starting...");
      this.backup.locations = Locations.getAll();
      this.getTrackers().then((trackers) => {
        this.fireChange("Trackers Loaded");
        if (trackers) {
          this.backup.trackers = trackers;
        }
        this.fireChange("Getting Boards");
        this.getBoards().then((boards) => {
          this.backup.boards = boards;
          this.fireChange("Getting Events...");
          this.getEvents().then((events) => {
            this.backup.events = events;
            this.fireChange(`${events.length} events loaded`);

            let downloadButton = document.createElement("a");
            downloadButton.setAttribute("href", URL.createObjectURL(new Blob([JSON.stringify(this.backup)], { type: "text/json" })));
            downloadButton.setAttribute("download", `nomie-APP_VERSION-${dayjs().format("YYYY-MM-DD-H:mm")}.json`);
            downloadButton.click();
            resolve();
          });
        });
      });
    });
  }

  getTrackers() {
    return Storage.get(`${config.data_root}/${config.tracker_file}`).then((res) => {
      return res;
    });
  }

  getBoards() {
    return Storage.get(`${config.data_root}/${config.board_file}`).then((res) => {
      return res;
    });
  }

  getEvents() {
    let flatten = (arr) =>
      [].concat.apply(
        [],
        arr.map((element) => (Array.isArray(element) ? flatten(element) : element))
      );
    // get all books
    return new Promise(async (resolve, reject) => {
      let books = await LedgerStore.listBooks();
      let finished = [];
      let loadNext = () => {
        if (finished.length < books.length) {
          Storage.get(books[finished.length]).then((book) => {
            finished.push(book);
            loadNext();
          });
        } else {
          let events = flatten(finished);
          resolve(events);
        }
      };
      loadNext();
    }); // end promise
  }

  onChange(func) {
    this.listeners.push(func);
  }

  fireChange(change) {
    this.listeners.forEach((func) => {
      func(change);
    });
  }
}
