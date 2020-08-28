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
import { Device } from "./device-store";
import { Lang } from "./lang";

// Stores

const console = new Logger("📊 $DashboardStore");

interface IDashboardStore {
  dashboards: Array<any>;
  activeIndex: number;
}

const DashboardStoreInit = (): any => {
  const state: IDashboardStore = {
    dashboards: [],
    activeIndex: 0, //Storage.local.get("dashboard/lastIndex")
  };

  const { update, subscribe, set } = writable(state);

  const methods = {
    async init(): Promise<void> {
      let dashboards = await methods.get();
      update((state: any) => {
        dashboards = dashboards || [];
        state.dashboards = dashboards
          .map((dashboard) => {
            return dashboard instanceof Dashboard ? dashboard : new Dashboard(dashboard);
          })
          .filter((d) => d);

        return state;
      });
    },
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
    saveIndex(index) {
      Storage.local.put("dashboard/lastIndex", index);
    },
    getIndex() {
      return Storage.local.get("dashboard/lastIndex") || 0;
    },
    toIndex(i: number) {
      update((state: IDashboardStore) => {
        if (i <= state.dashboards.length) {
          state.activeIndex = i;
        }
        methods.saveIndex(state.activeIndex);
        return state;
      });
    },
    async pickSize(widget: Widget) {
      async function setWidgetSize(sz) {
        widget.size = sz;
        await methods.save();
      }

      let sizes = [
        {
          title: Lang.t("general.small", "Small"),
          click() {
            setWidgetSize("sm");
          },
        },
        {
          title: Lang.t("general.medium", "Medium"),
          click() {
            setWidgetSize("md");
          },
        },
        {
          title: Lang.t("general.large", "Large"),
          click() {
            setWidgetSize("lg");
          },
        },
      ];
      Interact.popmenu({
        title: Lang.t("dashboard.change-widget-size", "Change Widget Size"),
        buttons: sizes,
      });
    },
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
    state(payload: any) {
      let _state;
      update((state) => {
        payload = { ...state, ...payload };
        return payload;
      });
      return payload;
    },
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
    async save(): Promise<any> {
      let dashboards;
      update((state: any) => {
        dashboards = JSON.parse(JSON.stringify(state.dashboards));
        return state;
      });
      dashboards = dashboards
        .filter((d) => d)
        .map((dashboard) => {
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
    data(): IDashboardStore {
      let _state;
      update((state: any) => {
        _state = state;
        return state;
      });
      return _state;
    },
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
