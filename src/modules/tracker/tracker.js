// import HookModel from './hook.class'
// import { Reminder } from '../services/reminders/reminders.module'
// import CardModel from './card.class'
import NomieUOM from "../../utils/nomie-uom/nomie-uom";
import md5 from "md5";

export default class TrackerConfig {
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
    this.emoji = starter.emoji || "⚪️";
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

    this.note = starter.note || null;

    this.hidden = starter.hidden === true ? true : false;

    this.hook = starter.hook || null;

    // If it's a timer, set if started else null
    if (this.type === "timer") {
      this.started = starter.started || null;
    }

    // Honestly, I don't remembrer what this is about
    if (starter.decimal === true) {
      this.decimal = true;
    } else {
      this.decimal = false;
    }
    // Holder for any scheduled reminders
    // Not used in Open Nomie since we don't
    // have a good means for notifications
    this.reminders = [];

    if (starter.reminders) {
      if (starter.reminders.length) {
        starter.reminders.forEach(reminder => {
          this.reminders.push(new Reminder(reminder));
        });
      }
    }

    if (starter.label) {
      this.label = starter.label;
    } else {
      this.label = this.displayTag();
      // this.label = 'dick'
    }
  }

  // Make the tag look good if no label is provided
  displayTag() {
    return this.tag
      .replace(/_/g, " ")
      .split(" ")
      .map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  toTag(str) {
    // TODO : make this replace special characters too
    return (str || "")
      .replace(/\!|\"|\?/g, "")
      .trim()
      .replace(/( )/g, "_")
      .toLowerCase();
  }

  displayValue(value) {
    let v = parseFloat(value) || 0;
    //return value;
    return NomieUOM.format(Math.round(v * 100) / 100, this.uom);
  }
}
