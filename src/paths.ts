import config from "../config/global";

const NPaths = {
  routes: {
    board(id) {
      return `/board/${id}`;
    },
    search(query: string) {
      return `/search?q=${encodeURIComponent(query)}`;
    },
  },
};

export default NPaths;
