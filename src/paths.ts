import config from "./config/appConfig";

const NPaths = {
  routes: {
    board(id) {
      return `/board/${id}`;
    },
    search() {
      return `/search`;
    },
    history() {
      return `/history`;
    },
    dashboard() {
      return `/dashboard`;
    },
    people() {
      return `/people`;
    },
    settings() {
      return "/settings";
    },
  },
  storage: {
    trackers() {
      return `${config.data_root}/trackers.json`;
    },
    search() {
      return `${config.data_root}/searches.json`;
    },
    book(id: string) {
      return `${config.data_root}/books/${id}`;
    },
  },
  local: {
    storage(path: string) {
      return `n4/storage/${path}`;
    },
    storageType() {
      return NPaths.local.storage(`root/storage_type`);
    },
    sidestore(path: string) {
      return `${config.data_root}/localDB/${path}`;
    },
  },
};

export default NPaths;
