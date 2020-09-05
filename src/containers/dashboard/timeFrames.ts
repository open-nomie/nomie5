import type { WidgetTimeFrameConfig } from "../../modules/dashboard/widget";

export const timeFrames: Array<WidgetTimeFrameConfig> = [
  {
    id: "today",
    label: "Today",
    start: {
      startOf: "day",
    },
    end: {
      endOf: "day",
    },
  },
  {
    id: "yesterday",
    label: "Yesterday",
    start: {
      subtract: [1, "day"],
      startOf: "day",
    },
    end: {
      subtract: [1, "day"],
      endOf: "day",
    },
  },
  {
    id: "last-7",
    label: "Last 7 days",
    start: {
      subtract: [6, "day"],
      startOf: "day",
    },
    end: {
      endOf: "day",
    },
  },
  {
    id: "last-30",
    label: "Last 30 days",
    start: {
      subtract: [29, "day"],
      startOf: "day",
    },
    end: {
      endOf: "day",
    },
  },
  {
    id: "last-90",
    label: "Last 90 days",
    start: {
      subtract: [89, "day"],
      startOf: "day",
    },
    end: {
      endOf: "day",
    },
  },
  {
    id: "last-365",
    label: "Last 365 days",
    start: {
      subtract: [365, "day"],
      startOf: "day",
    },
    end: {
      endOf: "day",
    },
  },
  {
    id: "this-week",
    label: "This Week",
    // This are not used, but required - search jank in widget.ts as to why
    start: {
      startOf: "week",
    },
    end: {
      endOf: "week",
    },
  },
  {
    id: "last-week",
    label: "Last Week",
    // This are not used, but required - search jank in widget.ts as to why
    start: {
      subtract: [1, "week"],
      startOf: "week",
    },
    end: {
      subtract: [1, "week"],
      endOf: "week",
    },
  },
  {
    id: "this-month",
    label: "This Month",
    start: {
      startOf: "month",
    },
    end: {
      endOf: "month",
    },
  },
  {
    id: "this-year",
    label: "This Year",
    start: {
      startOf: "year",
    },
    end: {
      endOf: "year",
    },
  },
  {
    id: "last-month",
    label: "Last Month",
    start: {
      subtract: [1, "month"],
      startOf: "month",
    },
    end: {
      subtract: [1, "month"],
      endOf: "month",
    },
  },
];
