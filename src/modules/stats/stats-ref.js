//Modules utils
import { strToColor } from "../../components/dymoji/dymoji";
import Tracker from "../../modules/tracker/tracker";
import StatsV5 from "./statsV5";
import extractor from "../../utils/extract/extract";

// Stores
import { LedgerStore } from "../../store/ledger";

class StatsReference {
  constructor(starter = {}) {
    this.type = starter.type;
    this.key = starter.key;
    this.base = starter.base;
    this.label = starter.label;
    this.stats = null;
    this.is24Hour = starter.is24Hour || false;
  }

  getSearchTerm() {
    return extractor.generateRaw(this.key, this.type);
  }

  getTracker() {
    if (this.type == "tracker") {
      return this.base;
    } else {
      // We have to force everything to kinda a tracker
      return new Tracker({
        math: "sum",
        tag: this.key,
        color: strToColor(this.label),
      });
    }
  }

  async getStats(timeSpan, fromDate, toDate) {
    // Prepare the Stat Processor
    const statsV5 = new StatsV5({ is24Hour: this.is24Hour });
    try {
      // Get SEarch Term
      let searchTerm = this.getSearchTerm();
      // Create Search Payload
      let payload = {
        search: searchTerm,
        start: fromDate.toDate(),
        end: toDate.toDate(),
      };
      // Get Resutls from Ledger
      let results = await LedgerStore.query(payload);
      // Process the Stats
      this.stats = statsV5.generate({
        rows: results,
        fromDate: fromDate,
        toDate: toDate,
        mode: timeSpan,
        tracker: this.getTracker(),
        trackableElement: extractor.toElement(searchTerm),
      });
      return this.stats;
    } catch (e) {
      throw e;
    }
  }
} // End Compare Model - TODO : move\

export default StatsReference;
