import { Widget, WidgetDate, WidgetTimeFrame } from "./widget";
import NDate from "../../utils/ndate/ndate";

let weekMoodWidget: any = {
  dateFormat: "MMM Do YYYY",
  includeAvg: false,
  timeFormat: "h:mm A",
  type: "barchart",
  id: "1bd372e4e536f3601093f805947ed45a",
  size: "md",
  timeRange: {
    label: "This Week",
    start: {
      startOf: "week",
    },
    end: {
      endOf: "week",
    },
    id: "this-week",
  },
  element: {
    id: "mood",
    type: "tracker",
    raw: "#mood",
    prefix: "#",
  },
  math: "mean",
};

let moodWidget = new Widget(weekMoodWidget);

describe("widget test suite", () => {
  it("should be an Widget", () => {
    expect(moodWidget).toBeInstanceOf(Widget);
  });
  it("should get things for Sunday users", () => {
    let start = NDate.getFirstDayOfWeek();
    let end = NDate.getLastDayOfWeek();
    let dateRange = moodWidget.getDateRange("1");
    expect(start.format("YYYY-MM-DD")).toBe(dateRange[0].format("YYYY-MM-DD"));
    expect(end.format("YYYY-MM-DD")).toBe(dateRange[1].format("YYYY-MM-DD"));
    expect(moodWidget.getTitle()).toBe("mood");
    expect(moodWidget.isValid()).toBe(true);
    expect(moodWidget.timeFormat).toBe("h:mm a");
    expect(start.format("ddd")).toBe("Sun");
    expect(end.format("ddd")).toBe("Sat");
  });

  it("should get things for Monday users", () => {
    NDate.setFirstDayOfWeek("2");
    let start = NDate.getFirstDayOfWeek();
    let end = NDate.getLastDayOfWeek();
    let dateRange = moodWidget.getDateRange("2");
    expect(start.format("YYYY-MM-DD")).toBe(dateRange[0].format("YYYY-MM-DD"));
    expect(end.format("YYYY-MM-DD")).toBe(dateRange[1].format("YYYY-MM-DD"));
    expect(start.format("ddd")).toBe("Mon");
    expect(end.format("ddd")).toBe("Sun");
  });
});
