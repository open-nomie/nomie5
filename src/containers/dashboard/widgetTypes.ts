export type IWidgetTypeUnit = "timeframe" | "cond-style" | "element";

export interface IWidgetType {
  id: string;
  label: string;
  requires: Array<IWidgetTypeUnit>;
  optional: Array<IWidgetTypeUnit>;
}

export const widgetTypes: Array<IWidgetType> = [
  {
    label: "Display Value",
    id: "value",
    requires: ["timeframe", "element"],
    optional: ["cond-style"],
  },
  {
    label: "Latest Note",
    id: "note",
    requires: ["timeframe", "element"],
    optional: [],
  },
  {
    label: "Bar Chart",
    id: "barchart",
    requires: ["timeframe", "element"],
    optional: [],
  },
  // {
  //   label: "Streak",
  //   id: "streak",
  //   requires: ["element", "timeframe"],
  //   optional: [],
  // },
  {
    label: "Line Chart",
    id: "linechart",
    requires: ["timeframe", "element"],
    optional: [],
  },
  {
    label: "Min / Max",
    id: "min-max",
    requires: ["timeframe", "element"],
    optional: [],
  },
  {
    label: "Map",
    id: "map",
    requires: ["timeframe", "element"],
    optional: [],
  },

  // This is not complete
  // {
  //   label: "What Time",
  //   id: "what-time",
  //   requires: ["timeframe", "element"],
  //   optional: [],
  // },
  {
    label: "Positivity Pie Chart",
    id: "positivity",
    requires: ["timeframe", "element"],
    optional: [],
  },
  // {
  //   label: "Streak",
  //   id: "streak",
  //   requires: ["timeframe", "element"],
  //   optional: [],
  // },
  {
    label: "Last Used",
    id: "last-used",
    requires: ["element"],
    optional: ["cond-style"],
  },
  {
    label: "Just Text",
    id: "text",
    requires: [],
    optional: [],
  },
];
