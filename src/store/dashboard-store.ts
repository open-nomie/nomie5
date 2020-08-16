// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
import Storage from "../modules/storage/storage";
import config from "../../config/global";
import { Dashboard } from "../modules/dashboard/dashboard";
import { Block } from "../modules/dashboard/block";
import { Interact } from "./interact";

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
        console.log("from store", { dashboards });
        return state;
      });
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
          dashboard.blocks = dashboard.blocks.map((block: any) => {
            delete block.stats;
            delete block.logs;
            if (block.element && block.element.obj) {
              delete block.element.obj;
            }
            return block;
          });
          return dashboard;
        });
      if (dashboards) {
        return Storage.put(`${config.data_root}/dashboards.json`, dashboards);
      } else {
        return false;
      }
    },
    async saveBlock(block: Block) {
      if (block) {
        let _state: IDashboardStore = methods.data();
        let found = false;
        delete block._editing;
        _state.dashboards = _state.dashboards.map((dashboard: Dashboard) => {
          dashboard.blocks = dashboard.blocks.map((blk: Block) => {
            if (blk.id == block.id) {
              found = true;
              return block;
            } else {
              return blk;
            }
          });
          return dashboard;
        });
        if (!found) {
          _state.dashboards[_state.activeIndex].blocks.push(block);
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
    async deleteBlock(block: Block) {
      block = block instanceof Block ? block : new Block(block);
      let _state: IDashboardStore = methods.data();
      _state.dashboards = _state.dashboards.map((dashboard: Dashboard) => {
        dashboard.blocks = dashboard.blocks.filter((blk: Block) => {
          return blk.id == block.id ? false : true;
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
      //   dashboards.push(new Dashboard({ label: "My First Dashboard", blocks: [] }));
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
