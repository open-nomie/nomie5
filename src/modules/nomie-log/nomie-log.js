import nid from "../../modules/nid/nid";

// Modules
import extractor from "../../utils/extract/extract";
import _calculateScore from "../../utils/calculate-score/calculate-score"; // Score calculator
import dayjs from "dayjs";
import math from "../../utils/math/math";

/**
 * Nomie Log / Record
 * It's been called a record since Nomie 1, but a log is a better name
 * you'll see i've used the term both thoughout - 🤦‍♂️
 */
export default class Record {
  constructor(starter) {
    starter = starter || {};

    this._dirty = starter._id ? undefined : true;

    this._id = starter._id || nid(10); // create a random 10 char id if not proviedd
    this.note = (starter.note || starter.notes || "").trim(); // Trim the note

    /**
     * Nomie uses the End date as the primary time.
     * Currently as of 4.4.1 there is no active use of start..
     */
    let end = starter.end ? new Date(starter.end) : new Date(); // set the end date
    let start = starter.start ? new Date(starter.start) : end;
    this.end = end.getTime();
    this.start = start.getTime();

    // Score Calculation
    // This Might be a bad idea - but i'm doing it anyways
    // If a score is set, use it - if not, calculate it.
    // If a score is 0 or not set
    //starter.score ||
    this.score = starter.score || _calculateScore(this.note, this.end);

    // Get location
    this.lat = starter.lat || null;
    this.lng = starter.lng || null;
    this.location = starter.location || "";

    // Get if this has been edited
    this.modified = starter.modified || false;

    // Get the source if provided
    this.source = starter.source || null;
  }

  // Get it as an object
  toObject() {
    return {
      _id: this._id,
      note: this.note,
      end: this.end,
      start: this.start,
      score: this.score,
      lat: this.lat,
      lng: this.lng,
      location: this.location,
      source: this.source,
      modified: this.modified,
    };
  }

  // Get a hash of this note
  hash() {
    return nid([this.note, this.start, this.end, this.lat, this.lng].join(""));
  }

  isValid() {
    return this.note.length > 0 || this.lat || this.lng;
  }

  calculateScore(note = null) {
    return _calculateScore(note || this.note, this.end);
  }

  setScore(score) {
    this.score = score;
  }

  // add a tag to the note
  addTag(tag, value) {
    if (value) {
      this.note = `${this.note} #${tag}(${value})`;
    } else {
      this.note = `${this.note} #${tag}`;
    }
    this.getMeta();
    return this;
  }

  // Does it have a specific  tracker?
  hasTracker(trackerTag) {
    if (!this.trackers) {
      this.getMeta();
    }
    return this.trackers.find((trackerElement) => trackerElement.id == trackerTag) ? true : false;
  }

  getTrackerValues(trackerTag) {
    return this.trackers
      .filter((trackerElement) => trackerElement.id == trackerTag)
      .map((trackerElement) => {
        console.log(`Mapping`, trackerElement, trackerElement.value);
        return trackerElement.value;
      });
  }

  // Get note length without tags
  noteTextLength() {
    return this.getScrubbedNote().length;
  }

  getScrubbedNote() {
    let results = this.note
      .split(" ")
      .filter((word) => {
        if (word.length > 1 && word.substr(0, 1) == "#") {
          return false;
        } else {
          return true;
        }
      })
      .join(" ");

    return results;
  }

  // Expand for more data
  expand() {
    return this.expanded();
  }

  expanded() {
    return Object.assign(this, {
      trackableElements: extractor.parse(this.note),
      duration: this.end - this.start,
      startDate: new Date(this.start),
      endDate: new Date(this.end),
    });
  }

  getTrackerValue(tag, calculateBy = "sum") {
    let values = this.getMeta()
      .trackers.filter((t) => t.id == tag)
      .map((trackableElements) => trackableElements.value);
    if (calculateBy == "sum") {
      return math.sum(values);
    } else {
      return math.average(values);
    }
  }

  getMeta() {
    let trackableElements = extractor.parse(this.note);
    return Object.assign(this, {
      duration: this.end - this.start,
      startDate: dayjs(this.start),
      endDate: dayjs(this.end),
      people: trackableElements.filter((te) => te.type == "person"),
      context: trackableElements.filter((te) => te.type == "context"),
      trackers: trackableElements.filter((te) => te.type == "tracker"),
    });
  }
}
