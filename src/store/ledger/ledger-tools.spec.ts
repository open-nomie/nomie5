import LedgerTools from "./ledger-tools";
import { DumbStorage } from "../../modules/storage/storage.dumb";
import NLog from "../../modules/nomie-log/nomie-log";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

import appConfig from "../../config/appConfig";
describe("Ledger Tools test sweeeeet", () => {
  let ledgerTools = new LedgerTools(DumbStorage);
  let baseDate = dayjs();
  let logs = [];
  logs.push(
    new NLog({
      note: "#log(1) firefly",
      end: dayjs(baseDate).day(1).hour(10).toDate().getTime(),
    })
  );
  logs.push(
    new NLog({
      note: "#log(4) free",
      end: dayjs(baseDate).day(1).hour(11).toDate().getTime(),
    })
  );
  logs.push(
    new NLog({
      note: "#log(1) freedom",
      end: dayjs(baseDate).day(1).hour(12).toDate().getTime(),
    })
  );

  it("should save a book of logs", async () => {
    let res = await ledgerTools.saveBook(baseDate.format(appConfig.book_time_format), logs);
    expect(res).toBeTruthy();
  });

  it("should get a book of logs", async () => {
    let res = await ledgerTools.getBook(baseDate.format(appConfig.book_time_format));
    expect(res.length).toBe(3);
    expect(res[0].note).toBe(logs[0].note);
    expect(res[1].note).toBe(logs[1].note);
    expect(res[2].note).toBe(logs[2].note);
  });

  it("should load up with dumb storage", () => {
    expect(ledgerTools).toBeTruthy();
  });

  it("should list books", async () => {
    let books = await ledgerTools.listBooks();
    expect(books[0]).toBe(`${appConfig.book_root}/${baseDate.format(appConfig.book_time_format)}`);
  });

  // TODO figure out how to get dayjs weekly format into jest

  // it("should convert the right date time", () => {
  //   dayjs.extend(weekOfYear);
  //   expect(dayjs().format(appConfig.book_time_format)).toBe("something");
  // });

  // it("should get first book date", async () => {
  //   let firstDate = await ledgerTools.getFirstDate(true);
  //   expect(firstDate).toBe("waht");
  // });

  it("should clean a dirty Object, and create a clean NLog", () => {
    let log = {
      note: " Dirty log man ",
      _dirty: true,
      stats: { random: "stuff " },
      meta: {},
      source: "test",
    };
    let cleaned: any = ledgerTools.prepareLogForSave(log);
    expect(cleaned.meta).toBeUndefined();
    expect(cleaned).toBeInstanceOf(NLog);
    expect(cleaned.source).toBe("test");
    expect(cleaned._ditry).toBeUndefined();
    expect(cleaned.start).toBeTruthy();
    expect(cleaned.note).toBe("Dirty log man");
  });

  it("should clean dirty NLog and clean it NLog", () => {
    let log: any = new NLog({});
    log.note = " Dirty log man ";
    log._dirty = true;
    log.stats = { random: "stuff " };
    log.meta = {};
    log.source = "test";
    let cleaned: any = ledgerTools.prepareLogForSave(log);
    expect(cleaned.meta).toBeUndefined();
    expect(cleaned).toBeInstanceOf(NLog);
    expect(cleaned.source).toBe("test");
    expect(cleaned._ditry).toBeUndefined();
    expect(cleaned.start).toBeTruthy();
    expect(cleaned.note).toBe("Dirty log man");
  });

  it("should get tracker values from logs (as used in today)", () => {
    let today = ledgerTools.getTrackersAndValuesFromLogs(logs);
    expect(today.log).toBeTruthy();
    expect(today.log.hours.join(",")).toBe("10,11,12");
    expect(today.log.values.join(",")).toBe("1,4,1");
  });
});
