// import HookModel from './hook.class'
// import { Reminder } from '../services/reminders/reminders.module'
// import CardModel from './card.class'
import NomieUOM from "../../utils/nomie-uom/nomie-uom";
import extract from "../../utils/extract/extract";

import md5 from "md5";

type ITrackerType = "tick" | "value" | "range" | "picker" | "note" | "timer";
type ITrackerMath = "sum" | "mean";

export default class TrackerConfig {
  id?: string; // Id of Tracker
  tag: string; // Tag of Tracker
  label?: string; // Label of the Tracker
  type?: ITrackerType; // Type of Tracker
  color?: string; // Color of Tracker
  math?: ITrackerMath; // Sum Mean?
  ignore_zeros?: Boolean; // Ignore Zeros when doing maths
  uom?: string; // Unit of Measure KEY
  emoji?: string; // Emoji for the Tracker
  default?: string | number; // Default value for a tracker
  max?: number; // Max of a Range
  min?: number; // Min of a Range
  score?: number; // Current Score?
  score_calc?: any; // Positivity Score calc
  goal?: any; // NOT USED
  one_tap?: boolean; // One tapper?
  include?: string; // Content to always include when tracking this tracker
  note?: string; // Content to include when a note tracker
  hidden?: boolean; // Hidden from All Board
  started?: Date; // If its started (and a timer based tracker)
  picks?: Array<string>; // Picks for a Picker type of tracker
  private _dirty?: boolean;

  constructor(starter) {
    // Starter is generic object with params
    starter = starter || {};
    // The tracker name
    this.tag = this.toTag(starter.tag || "");
    //
    if (!this.tag.length) {
      this._dirty = true;
    }
    this.id = starter.id || md5(Math.random());
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
    this.default = starter.default || null;
    // max
    if (this.type === "range") {
      this.max = starter.max ? starter.max.toString() : "10";
      // min
      this.min = starter.max ? starter.min.toString() : "1";
      // cards
    }
    // score
    this.score = starter.score || null;
    // Dynamic Score
    this.score_calc = starter.score_calc || null;
    // Goal Config
    this.goal = starter.goal || null;
    // one tap
    this.one_tap = starter.one_tap === true ? true : false;
    // include
    this.include = starter.include || "";
    // Primary NOte
    this.note = starter.note || null;

    // Hide from All Board
    this.hidden = starter.hidden === true ? true : false;

    // If it's a timer, set if started else null
    if (this.type === "timer") {
      this.started = starter.started || null;
    }

    this.picks = starter.picks || undefined;

    if (starter.label) {
      this.label = starter.label;
    } else {
      this.label = this.displayTag();
    }
  }

  getUID() {
    return md5(this.tag);
  }

  getIncluded(value) {
    let includedStr = (this.include || "").replace(/\*/g, value || "");
    return includedStr.trim();
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
    return (str || "")
      .replace(/[^\w\s]/gi, "")
      .trim()
      .replace(/( )/g, "_")
      .toLowerCase();
  }

  displayValue(value, unit = true) {
    let v = parseFloat(value) || 0;
    //return value;
    return NomieUOM.format(Math.round(v * 100) / 100, this.uom, unit);
  }
}
