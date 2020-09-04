import NDate from "./ndate";
import dayjs from "dayjs";

describe("NDate Test Suite", () => {
  it("should get this week and last week", () => {
    let thisWeek = NDate.thisWeek();
    let lastWeek = NDate.lastWeek();

    console.log({ thisWeek, lastWeek });
    expect(dayjs(thisWeek[0]).format("ddd")).toBe("Sun");
    expect(dayjs(thisWeek[6]).format("ddd")).toBe("Sat");
    let firstDayOfWeek = NDate.getFirstDayOfWeek();
    expect(dayjs(firstDayOfWeek).format("ddd")).toBe("Sun");
  });

  it("should get this week and last week - when monday is the first day", () => {
    NDate.setFirstDayOfWeek("2");
    let thisWeek = NDate.thisWeek();
    let lastWeek = NDate.lastWeek();

    console.log({ thisWeek, lastWeek });
    expect(dayjs(thisWeek[0]).format("ddd")).toBe("Mon");
    expect(dayjs(thisWeek[6]).format("ddd")).toBe("Sun");

    let firstDayOfWeek = NDate.getFirstDayOfWeek();
    expect(dayjs(firstDayOfWeek).format("ddd")).toBe("Mon");
  });
});
