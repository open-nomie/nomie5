import config from "./config/appConfig";

const NPaths = {
  routes: {
    board(id) {
      return `/board/${id}`;
    },
    search(query: string) {
      return `/search?q=${encodeURIComponent(query)}`;
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
