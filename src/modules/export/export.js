// Modules
import Storage from "../storage/storage";
// stores
import config from "../../../config/global";
import { LedgerStore } from "../../store/ledger";
import { Interact } from "../../store/interact";
import { PeopleStore } from "../../store/people-store";
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
      trackers: {},
      people: {},
      locations: [],
    };
  }

  async start() {
    try {
      this.fireChange("People...");
      // Get People
      let people = await PeopleStore.getPeople();
      this.backup.people = people || {};

      this.fireChange("Locations...");
      let locations = await Locations.getAll();
      this.backup.locations = locations || [];

      // Get Trackers
      this.fireChange("Trackers...");
      let trackers = await this.getTrackers();

      if (trackers) {
        this.backup.trackers = trackers;
      }
      // Get Boards
      this.fireChange("Boards...");
      let boards = await this.getBoards();
      this.backup.boards = boards;
      // Get Events
      this.fireChange("Events...");
      let events = await this.getEvents();
      this.backup.events = events || [];
      this.fireChange(`${(events || []).length} events loaded`);
      // Setup a Document to Download
      let downloadButton = document.createElement("a");
      downloadButton.setAttribute("href", URL.createObjectURL(new Blob([JSON.stringify(this.backup)], { type: "text/json" })));
      downloadButton.setAttribute("download", `nomie-APP_VERSION-${dayjs().format("YYYY-MM-DD-H:mm")}.json`);
      downloadButton.click();
    } catch (e) {
      Interact.alert("Export Error", e.message);
    }
  }

  getTrackers() {
    return Storage.get(`${config.data_root}/${config.tracker_file}`).then((res) => {
      return res;
    });
  }

  getPeople() {
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
          this.fireChange(`${config.book_time_unit} ${finished.length} of ${books.length}`);
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
