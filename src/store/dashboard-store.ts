// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
import Storage from "../modules/storage/storage";
import config from "../config/appConfig";

import { Widget } from "../modules/dashboard/widget";
import { Interact } from "./interact";
import { Dashboard } from "../modules/dashboard/dashboard";

// Stores
import { Device } from "./device-store";
import { Lang } from "./lang";

const console = new Logger("📊 $DashboardStore");

interface IDashboardStore {
  dashboards: Array<any>;
  activeIndex: number;
}

/**
 * Dashboard Store
 * Used for managing the dashboard View
 */
const DashboardStoreInit = (): any => {
  // Array of Dashboard and the active dashboard index
  const state: IDashboardStore = {
    dashboards: [],
    activeIndex: 0, //Storage.local.get("dashboard/lastIndex")
  };

  const { update, subscribe, set } = writable(state);

  const methods = {
    // Initialize the Dashboard Store
    async init(): Promise<void> {
      // Get From storage
      let dashboards = await methods.get();
      const lastIndex = Storage.local.get("dashboard/lastIndex");
      // Update State with what's in storage
      update((state: IDashboardStore) => {
        dashboards = dashboards || [];
        // If the last Index doesn't exist
        if (dashboards.length - 1 > lastIndex) {
          state.activeIndex = lastIndex || 0;
        }
        // Map the Dashboards to Dashboard Objects
        state.dashboards = dashboards
          .map((dashboard) => {
            return dashboard instanceof Dashboard ? dashboard : new Dashboard(dashboard);
          })
          .filter((d) => d);

        return state;
      });
    },
    /**
     * Move Widget
     * @param widget
     * @param dashboard
     */
    async moveWidget(widget: Widget, dashboard: Dashboard) {
      update((state: IDashboardStore) => {
        // Remove it from the current dashboard
        let dashboards = state.dashboards.map((loopDashboard: Dashboard) => {
          loopDashboard.widgets = loopDashboard.widgets.filter((loopWidget: Widget) => {
            return loopWidget.id !== widget.id;
          });
          if (loopDashboard.id == dashboard.id) {
            loopDashboard.widgets.push(widget);
          }
          return loopDashboard;
        });
        // Add to state - will it work?
        state.dashboards = dashboards;
        return state;
      });
      return await methods.save();
    },
    /**
     * Save the Last Used Index
     * @param index
     */
    saveIndex(index) {
      Storage.local.put("dashboard/lastIndex", index);
    },
    /**
     * Get Last Used Index
     */
    getIndex() {
      return Storage.local.get("dashboard/lastIndex") || 0;
    },
    /**
     * Send user to Tab Index
     * @param i
     */
    toIndex(i: number) {
      update((state: IDashboardStore) => {
        if (i <= state.dashboards.length) {
          state.activeIndex = i;
        }
        methods.saveIndex(state.activeIndex);
        return state;
      });
    },
    /**
     * Options for Widget
     * @param widget
     * @param select function
     */
    async widgetOptions(widget: Widget, select: Function) {
      select = select || function () {};

      async function setWidgetSize(sz) {
        widget.size = sz;
        await methods.save();
      }

      let buttons = [
        {
          title: `${Lang.t("dashboard.edit-widget", "Edit Widget")}...`,
          icon: "edit",
          click() {
            select("edit", widget);
          },
        },
        {
          divider: true,
          title: `${Lang.t("dashboard.small-widget", "Small Widget")}`,
          icon: widget.size == "sm" ? "checkmarkOutline" : undefined,
          click() {
            setWidgetSize("sm");
          },
        },
        {
          title: `${Lang.t("dashboard.medium-widget", "Medium Widget")}`,
          icon: widget.size == "md" ? "checkmarkOutline" : undefined,
          click() {
            setWidgetSize("md");
          },
        },
        {
          title: `${Lang.t("dashboard.large-widget", "Large Widget")}`,
          icon: widget.size == "lg" ? "checkmarkOutline" : undefined,
          click() {
            setWidgetSize("lg");
          },
        },
        {
          divider: true,
          title: `${Lang.t("general.duplicate", "Duplicate")}...`,
          click() {
            select("duplicate", widget);
          },
          icon: "duplicate",
        },
        {
          title: `${Lang.t("dashboard.move-to", "Move to")}...`,
          click() {
            select("move", widget);
          },
          icon: "switch",
        },
        {
          divider: true,
          title: `${Lang.t("dashboard.delete-widget", "Delete Widget")}...`,
          click() {
            select("delete", widget);
          },
          icon: "delete",
        },
      ];

      Interact.popmenu({
        title: Lang.t("dashboard.widget-options", "Widget Options"),
        buttons: buttons,
      });
    },
    /**
     * Create a New Dashboard
     */
    async newDashboard() {
      let name = await Interact.prompt("Create new Dashboard", null, {
        placeholder: "Dashboard Label",
      });
      if (name) {
        let dashboard = new Dashboard({ label: name });
        update((state) => {
          state.dashboards.push(dashboard);
          state.activeIndex = state.dashboards.length - 1;
          return state;
        });
        return await methods.save();
      }
    },
    state(payload: any = {}) {
      update((state) => {
        payload = { ...state, ...payload };
        return payload;
      });
      return payload;
    },
    /**
     * Go to Next Tab
     */
    next() {
      update((state: IDashboardStore) => {
        if (state.activeIndex == state.dashboards.length - 1) {
          state.activeIndex = 0;
        } else {
          state.activeIndex++;
        }
        methods.saveIndex(state.activeIndex);
        return state;
      });
    },
    /**
     * Previous Tab
     */
    previous() {
      update((state: IDashboardStore) => {
        if (state.activeIndex == 0) {
          state.activeIndex = state.dashboards.length - 1;
        } else {
          state.activeIndex--;
        }
        methods.saveIndex(state.activeIndex);
        return state;
      });
    },
    /**
     * Save the Dashboards to Storage
     */
    async save(): Promise<any> {
      let dashboards;
      update((state: any) => {
        dashboards = JSON.parse(JSON.stringify(state.dashboards));
        return state;
      });
      // Filter out any emptys
      dashboards = dashboards
        .filter((d) => d)
        .map((dashboard) => {
          // Map out any artifcats like logs, stats, positivity
          dashboard.widgets = dashboard.widgets.map((widget: any) => {
            delete widget.stats;
            delete widget.logs;
            delete widget.positivity;
            if (widget.element && widget.element.obj) {
              delete widget.element.obj;
            }
            return widget;
          });
          return dashboard;
        });
      if (dashboards) {
        return Storage.put(`${config.data_root}/dashboards.json`, dashboards);
      } else {
        return false;
      }
    },
    /**
     * Save a Widget
     * @param widget
     */
    async saveWidget(widget: Widget) {
      if (widget) {
        let _state: IDashboardStore = methods.data();
        let found = false;
        delete widget._editing;
        _state.dashboards = _state.dashboards.map((dashboard: Dashboard) => {
          dashboard.widgets = dashboard.widgets.map((blk: Widget) => {
            if (blk.id == widget.id) {
              found = true;
              return widget;
            } else {
              return blk;
            }
          });
          return dashboard;
        });
        if (!found) {
          _state.dashboards[_state.activeIndex].widgets.push(widget);
        }
        update((state: any) => {
          state.dashboards = _state.dashboards;
          return state;
        });
        return methods.save();
      }
    },
    /**
     * Delete a Dashboard
     * @param dashboard
     */
    async delete(dashboard: Dashboard) {
      update((state: IDashboardStore) => {
        state.dashboards = state.dashboards.filter((dash: Dashboard) => {
          return dash !== dashboard;
        });
        state.activeIndex = 0;
        return state;
      });
      return methods.save();
    },
    /**
     * This is a duplicate of state
     * TODO: fix this
     */
    data(): IDashboardStore {
      let _state;
      update((state: any) => {
        _state = state;
        return state;
      });
      return _state;
    },
    /**
     * Delete a Widget
     * @param widget
     */
    async deleteWidget(widget: Widget) {
      widget = widget instanceof Widget ? widget : new Widget(widget);
      let _state: IDashboardStore = methods.data();
      _state.dashboards = _state.dashboards.map((dashboard: Dashboard) => {
        dashboard.widgets = dashboard.widgets.filter((blk: Widget) => {
          return blk.id == widget.id ? false : true;
        });
        return dashboard;
      });
      update((state: any) => {
        state.dashboards = _state.dashboards;
        return state;
      });
      return methods.save();
    },
    /**
     * Get From Storage
     */
    async get(): Promise<Array<Dashboard>> {
      let dashboards = await Storage.get(`${config.data_root}/dashboards.json`);
      if (dashboards instanceof Array === false) {
        dashboards = [];
      }
      // if (!dashboards.length) {
      //   dashboards.push(new Dashboard({ label: "My First Dashboard", widgets: [] }));
      // }
      return dashboards;
    },
  };

  return {
    update,
    subscribe,
    set,

    ...methods,
  };
};

export const DashboardStore = DashboardStoreInit();
