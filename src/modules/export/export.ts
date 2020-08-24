// Modules
import Storage from "../storage/storage";
// stores
import config from "../../config/appConfig";
import { LedgerStore } from "../../store/ledger";
import { Interact } from "../../store/interact";
import { PeopleStore } from "../../store/people-store";
import { Locations } from "../../store/locations";
import { DashboardStore } from "../../store/dashboard-store";
import { ContextStore } from "../../store/context-store";
//vendors
import dayjs from "dayjs";
import type Board from "../board/board";
import type NLog from "../nomie-log/nomie-log";
import type { Dashboard } from "../dashboard/dashboard";
import type Location from "../locate/Location";
import type { ITrackers, IPeople } from "../import/import";

export interface IBackupItems {
  nomie: {
    number: string;
    created: string;
    startDate: string;
    endDate: string;
  };
  boards: Array<Board>;
  events: Array<NLog>;
  trackers: ITrackers;
  people: IPeople;
  locations: Array<Location>;
  dashboards: Array<Dashboard>;
  context: Array<string>;
}

export default class Export {
  listeners: Array<Function>;
  format: string;
  backup: IBackupItems;

  constructor(options: any = {}) {
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
      boards: options.boards || [],
      events: options.events || [],
      trackers: options.trackers || {},
      people: options.people || {},
      locations: options.locations || [],
      dashboards: options.dashboards || [],
      context: options.context || [],
    };
  }

  async start() {
    try {
      this.fireChange("People...");
      // Get People
      let people = await PeopleStore.getPeople();
      this.backup.people = people || {};

      this.fireChange("Dashboards...");
      let dashboards = await DashboardStore.get();
      this.backup.dashboards = dashboards;

      this.fireChange("Context...");
      let context = await ContextStore.get();
      this.backup.context = context;

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

  getEvents(): Promise<Array<any>> {
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
