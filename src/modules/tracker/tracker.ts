// import HookModel from './hook.class'
// import { Reminder } from '../services/reminders/reminders.module'
// import CardModel from './card.class'
import NomieUOM from "../../utils/nomie-uom/nomie-uom";
import extract from "../../utils/extract/extract";
import nid from "../nid/nid";
import TrackableElement from "../trackable-element/trackable-element";

export type ITrackerType = "tick" | "value" | "range" | "picker" | "note" | "timer";
export type ITrackerMath = "sum" | "mean";

export function toTag(str: string) {
  return (str || "")
    .replace(/('|"|\?|-|\)|\(|\*|\&|\||\$|\@|\+|\#)/gi, "")
    .trim()
    .replace(/( )/g, "_")
    .toLowerCase();
}

export interface ITracker {
  id?: string; // Id of Tracker
  tag?: string; // Tag of Tracker
  label?: string; // Label of the Tracker
  type?: ITrackerType; // Type of Tracker
  color?: string; // Color of Tracker
  math?: ITrackerMath; // Sum Mean?
  ignore_zeros?: boolean; // Ignore Zeros when doing maths
  uom?: string; // Unit of Measure KEY
  emoji?: string; // Emoji for the Tracker
  default?: number; // Default value for a tracker
  max?: number; // Max of a Range
  min?: number; // Min of a Range
  step?: number; // number of steps for a range
  score?: number; // Current Score?
  score_calc?: any; // Positivity Score calc
  goal?: any; // NOT USED
  one_tap?: boolean; // One tapper?
  include?: string; // Content to always include when tracking this tracker
  note?: string; // Content to include when a note tracker
  hidden?: boolean; // Hidden from All Board
  started?: number; // If its started (and a timer based tracker)
  picks?: Array<string>; // Picks for a Picker type of tracker
}

export default class TrackerConfig {
  public id?: string; // Id of Tracker
  public tag: string; // Tag of Tracker
  public label?: string; // Label of the Tracker
  public type?: ITrackerType; // Type of Tracker
  public color?: string; // Color of Tracker
  public math?: ITrackerMath; // Sum Mean?
  public ignore_zeros?: boolean; // Ignore Zeros when doing maths
  public uom?: string; // Unit of Measure KEY
  public emoji?: string; // Emoji for the Tracker
  public default?: number; // Default value for a tracker
  public max?: number; // Max of a Range
  public min?: number; // Min of a Range
  public step?: number; // Steps for Range
  public score?: number; // Current Score?
  public score_calc?: any; // Positivity Score calc
  public goal?: any; // NOT USED
  public one_tap?: boolean; // One tapper?
  public include?: string; // Content to always include when tracking this tracker
  public note?: string; // Content to include when a note tracker
  public hidden?: boolean; // Hidden from All Board
  public started?: number; // If its started (and a timer based tracker)
  public picks?: Array<string>; // Picks for a Picker type of tracker
  public _dirty?: boolean;

  constructor(starter) {
    // Starter is generic object with params
    starter = starter || {};
    // The tracker name
    this.tag = this.toTag(starter.tag || "");
    //
    if (!this.tag.length) {
      this._dirty = true;
    } else {
      this._dirty = undefined;
    }
    this.id = starter.id || nid();
    // Set the Type of the Input
    this.type = starter.type || "tick";
    // Set the color if it's passed
    this.color = starter.color || "#369DD3";
    // Set Math if it's passed
    this.math = starter.math || "sum";
    // Set Zeros is its passed
    this.ignore_zeros = starter.ignore_zeros || false;
    // Set UOM or default to num
    this.uom = starter.uom || "num";
    // Set if encrypt
    // this.always_encrypt = starter.always_encrypt === true ? true : false
    // SEt Emoji
    this.emoji = starter.emoji || "⚪";
    // set Default value
    this.default = starter.default;
    // max
    if (this.type === "range") {
      this.max = starter.max ? starter.max.toString() : "10";
      // min
      this.min = starter.max ? starter.min.toString() : "1";
      // step
      this.step = starter.step || "1";
    }
    // score
    this.score = starter.score;
    // Dynamic Score
    this.score_calc = starter.score_calc;
    // Goal Config
    this.goal = starter.goal;
    // one tap
    this.one_tap = starter.one_tap === true ? true : false;
    // include
    this.include = starter.include || "";
    // Primary NOte
    this.note = starter.note;

    // Hide from All Board
    this.hidden = starter.hidden === true ? true : false;

    // If it's a timer, set if started else null
    if (this.type === "timer") {
      this.started = starter.started;
    }

    this.picks = starter.picks || undefined;

    if (starter.label) {
      this.label = starter.label;
    } else {
      this.label = this.displayTag();
    }
  }

  getUID() {
    return nid(this.tag);
  }

  getIncluded(value) {
    let includedStr = (this.include || "").replace(/\*/, value || "");
    return includedStr.trim();
  }

  toTrackableElement(): TrackableElement {
    return this.getTrackableElement();
  }

  getTrackableElement(): TrackableElement {
    return new TrackableElement({
      id: this.tag,
      type: "tracker",
      raw: `#${this.tag}`,
      obj: this,
    });

    // this.id = starter.id; // brandon of @brandon, meet of #meet, home of +home
    // this.type = starter.type; // tracker, person, context
    // this.raw = starter.raw; // the raw string
    // this.value = starter.value; // any value passed or 1
    // this.prefix = starter.prefix; // @ # or +
    // this.remainder = starter.remainder; // holder of any characters after this
    // this.obj = starter.obj; // holder of related things
  }

  // Make the tag look good if no label is provided
  displayTag() {
    return this.tag
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  toTag(str) {
    // TODO : make this replace special characters too
    return toTag(str);
  }

  displayValue(value, unit = true) {
    let v = parseFloat(value) || 0;
    //return value;
    return NomieUOM.format(Math.round(v * 100) / 100, this.uom, unit);
  }
}
