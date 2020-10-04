import snakeCase from "../../utils/snake-case/snake-case";
import stringToValue from "../../utils/string-to-value/string-to-value";
import extractor from "../../utils/extract/extract";

export type ITrackableElementType = "tracker" | "person" | "context" | "generic" | "line-break" | "link";
export interface ITrackableElement {
  id?: string;
  type?: ITrackableElementType;
  raw?: string;
  value?: any;
  prefix?: any;
  remainder?: any;
  obj?: any;
  getPrefix?: any;
  toSearchTerm?: any;
}

export function toElement(str: string) {
  return extractor.toElement(str);
}

export default class TrackableElement {
  id?: string;
  type?: ITrackableElementType;
  raw?: string;
  value?: any;
  prefix?: any;
  remainder?: any;
  obj?: any;
  constructor(starter: ITrackableElement) {
    if (typeof starter == "object") {
      this.id = starter.id; // brandon of @brandon, meet of #meet, home of +home
      this.type = starter.type; // tracker, person, context
      this.raw = starter.raw; // the raw string
      this.value = starter.value; // any value passed or 1
      this.prefix = starter.prefix; // @ # or +
      this.remainder = starter.remainder; // holder of any characters after this
      this.obj = starter.obj; // holder of related things
    }

    // Lowercase the ID no matter what
    if (this.id) {
      this.id = this.id.toLowerCase().trim();
    }

    // if type but no prefix, set the prefix
    if (this.type && !this.prefix) {
      this.prefix = this.getPrefix();
    }
    // If no raw set, set it
    if (this.type && this.id && !this.raw) {
      this.raw = `${this.prefix}${this.id}`;
    }
    if (this.raw && !this.id) {
      this.id = snakeCase(this.raw);
      switch (this.raw.substr(0, 1)) {
        case "#":
          this.prefix = "#";
          this.type = "tracker";
          // See if there's a value provided as in #tracker(value)
          let valueSplit: Array<any> = this.raw.split("(");
          if (valueSplit.length == 2) {
            // Convert it to a number.
            this.value = stringToValue(valueSplit[1].replace(")", ""));
          }
          break;
        case "+":
          this.prefix = "+";
          this.type = "context";
          break;
        case "@":
          this.prefix = "@";
          this.type = "person";
          break;
      }
    }
  }

  public getPrefix(type?: string): string {
    type = type || this.type;
    switch (type) {
      case "tracker":
        return "#";
        break;
      case "person":
        return "@";
        break;
      case "context":
        return "+";
        break;
      default:
        return "";
        break;
    }
  }

  public toSearchTerm(): string {
    return `${this.prefix}${this.id}`;
  }
}
