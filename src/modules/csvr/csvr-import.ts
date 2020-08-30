import NLog from "../../modules/nomie-log/nomie-log";
import Papa from "papaparse";
import dayjs from "dayjs";

export interface IImportConfig {
  hasHeaders: boolean;
  template: string;
  locationNameField?: string;
  endField: number; // end date
  latField?: number;
  lngField?: number;
  sourceField?: number;
}

export interface IImportFields {
  [key: string]: string;
}

class CSVRImport {
  parsed: {
    data: Array<Array<string>>;
    errors: Array<any>;
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
    };
  };
  nlogs: Array<NLog>;
  config: IImportConfig;
  errors: Array<any>;
  constructor(config: IImportConfig) {
    this.config = config;
  }
  public csv(content: string): CSVRImport {
    this.parsed = Papa.parse(content);
    return this;
  }
  private toFields(row: Array<string>): IImportFields {
    let fields = {};
    row.forEach((cell: string, index: number) => {
      fields[`f${index}`] = cell;
    });
    return fields;
  }
  private fieldsToNote(fields: IImportFields): string {
    let base = `${this.config.template}`;
    Object.keys(fields).forEach((fieldKey) => {
      base = base.replace("{" + fieldKey + "}", fields[fieldKey]);
    });
    return base;
  }
  public getHeaders(): Array<string> {
    return this.parsed.data[0];
  }
  public toLogs(): Array<NLog> {
    let logs: Array<NLog> = [];
    let rows = this.parsed.data;
    rows.forEach((row: Array<string>, index: number) => {
      try {
        let fields: IImportFields = this.toFields(row);
        let note = this.fieldsToNote(fields);
        let log = new NLog({
          note,
          end: dayjs(row[this.config.endField]).toDate().getTime(),
        });
        if (this.config.latField && this.config.lngField) {
          log.lat = parseFloat(row[this.config.latField]);
          log.lng = parseFloat(row[this.config.latField]);
        }
        if (this.config.locationNameField) {
          log.location = row[this.config.locationNameField];
        }
        if (this.config.sourceField) {
          log.source = row[this.config.sourceField];
        } else {
          log.source = "importer";
        }
        logs.push(log);
      } catch (e) {
        this.errors.push(`Row #${index} errored: ${e.message}`);
      }
    });
    return logs;
  }
}

export default CSVRImport;
