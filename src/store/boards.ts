/**
 * Board Store
 *
 * This is pretty messy and needs to be cleaned up and organized
 */

import { writable } from "svelte/store";
import { navigate } from "svelte-routing";

// Modules
import Storage from "../modules/storage/storage";

// Stores
import config from "../config/appConfig";

// Utils

import Logger from "../utils/log/log";
import type { ITrackers } from "../modules/import/import";
import { Interact } from "./interact";
import nid from "../modules/nid/nid";
import Board from "../modules/board/board";
import Export from "../modules/export/export";
import { TrackerStore } from "./tracker-store";

//

const console = new Logger("♟ BoardStore ♟");

const boardsInit = () => {
  let base = {
    active: localStorage.getItem("active-board") || "all",
    boards: [],
    loaded: false,
    activeBoard: null,
  };

  const { subscribe, set, update } = writable(base);

  const methods = {
    async initialize() {
      console.log("Board Initialize()");
      // trackers = tkrs;
      let boards = await Storage.get(`${config.data_root}/boards.json`);
      if (boards) {
        methods.load(boards);
      }
      return boards;
    },
    setActive(id) {
      if (id) {
        localStorage.setItem("active-board", id);
        return update((bs) => {
          bs.active = id;
          bs.activeBoard = bs.boards.find((b) => b.id == bs.active);
          return bs;
        });
      }
    },
    export(id: string) {
      const boards = methods.data();
      const trackers = TrackerStore.data();
      console.log({ boards, trackers });
      let exporter = new Export({ boards: boards });
      console;
    },
    move(dir: "next" | "previous") {
      update((state) => {
        let index = state.boards.findIndex((b) => b.id == state.active);
        let nextIndex;
        if (dir == "next") {
          nextIndex = index < state.boards.length - 1 ? index + 1 : 0;
        } else {
          nextIndex = index > 0 ? index - 1 : state.boards.length - 1;
        }
        let board = state.boards[nextIndex];
        if (board) {
          methods.setActive(board.id);
        }
        return state;
      });
    },
    next() {
      methods.move("next");
    },
    previous() {
      methods.move("previous");
    },
    load(boards: Array<Board>) {
      return update((bs) => {
        let map = {};
        // Filter out duplicate ID boards
        // TODO: figure out why duplicates happen on board saving
        bs.boards = boards.filter((board) => {
          map[board.id] = map[board.id] || null;
          if (!map[board.id]) {
            map[board.id] = true;
            return true;
          } else {
            return false;
          }
        });
        bs.loaded = true;
        // Get the active board based on active id
        bs.activeBoard = bs.boards.find((b) => b.id == bs.active);

        if (bs.activeBoard) {
          // remove any nulls from the tracker array if they exist
          bs.activeBoard.trackers = (bs.activeBoard.trackers || []).filter((b) => (b ? true : false));
        }
        // return state
        return bs;
      });
    },
    _save() {
      let boards;
      update((d) => {
        boards = d.boards;
        return d;
      });
      if (boards) {
        boards = boards.filter((b) => {
          return b.id !== "all";
        });
        methods.save(boards);
      }
    },
    save(boards) {
      return Storage.put(`${config.data_root}/boards.json`, boards);
    },
    // labelById(id) {
    //   let label = (base.boards.find((b) => b.id === id) || {}).label;
    //   return label ? label : "";
    // },
    addTracker(tracker) {
      return methods.addTrackersToActiveBoard([tracker]);
    },
    data() {
      let d = null;
      update((bs) => {
        d = bs;
        return d;
      });
      return d;
    },
    async deleteConfirm(board) {
      let confirmed = await Interact.confirm("Delete " + board.label + " tab?", "You can recreate it later, but it's not super easy.");
      if (confirmed === true) {
        await methods.deleteBoard(board.id);
        navigate("/");
        Interact.toast("Board Deleted");
      }
    },
    deleteBoard(boardId) {
      let boards;
      update((bs) => {
        bs.boards = bs.boards.filter((board) => {
          return board.id !== boardId;
        });
        boards = bs.boards;
        // TODO - this save method name is not right
        return bs;
      });
      return methods.save(boards).then(() => {
        return methods.setActive("all");
      });
    },
    removeTrackerFromBoard(tracker, boardId) {
      let res;
      update((bs) => {
        let board = methods.boardById(boardId);
        if (board) {
          board.trackers = board.trackers.filter((tag) => {
            return tag !== tracker.tag;
          });
          res = methods.save(bs.boards);
        }
        return bs;
      });
      return res;
    },

    get(id) {
      return methods.boardById(id);
    },
    activeBoardContains(tracker) {
      let contains = false;
      tracker = tracker.tag || tracker; // if it's an object use the tag, otherwise assume it's a string
      update((d) => {
        contains = d.activeBoard.indexOf(tracker) > -1;
        return d;
      });
      return contains;
    },
    saveBoard(boardToSave) {
      return new Promise((resolve) => {
        update((bs) => {
          let existing = bs.boards.find((brd) => brd.id == boardToSave.id);
          if (existing) {
            bs.boards = bs.boards.map((board) => {
              return board.id == boardToSave.id ? boardToSave : board;
            });
          } else {
            bs.boards.push(boardToSave);
          }
          methods.save(bs.boards).then(resolve);
          return bs;
        });
      });
    },
    boardById(id) {
      let base;
      update((state) => {
        base = state;
        return state;
      });
      return base.boards.find((b) => {
        return b.id == id;
      });
    },
    labelById(id) {
      return (methods.boardById(id) || {}).label;
    },
    activeLabel() {
      return (methods.boardById(base.active) || {}).label;
    },
    sortActiveTrackers(tagsArray) {
      update((bs) => {
        let board = methods.boardById(bs.activeBoard.id);
        board.trackers = tagsArray;
        methods.save(bs.boards);
        return bs;
      });
    },
    addTrackersToActiveBoard(trackerArray) {
      return methods.addTrackersToBoard(trackerArray, base.active);
    },
    addTrackersToBoard(trackerArray, boardId) {
      update((bs) => {
        // Find the board by id.
        let board = methods.boardById(boardId);
        // if it's found
        if (board) {
          // loop over trackers to push
          // TODO: tried to make this a spread - but I keep breaking it.
          trackerArray
            .filter((t) => {
              return t ? true : false;
            })
            .forEach((tkr) => {
              if (board.trackers.indexOf(tkr.tag) === -1) {
                board.trackers.push(tkr.tag);
              }
            });

          methods.save(bs.boards);
        }

        return bs;
      });
    },
    addBoard(label, trackers) {
      trackers = trackers || [];
      return new Promise((resolve, reject) => {
        let id = nid(new Date().getTime() + label).substr(0, 10);
        let boardStub = {
          id: id,
          label: label,
          trackers: trackers,
        };
        update((bs) => {
          bs.boards.push(boardStub);
          Storage.put(`${config.data_root}/boards.json`, bs.boards)
            .then(() => {
              resolve(boardStub);
            })
            .catch(reject);
          return bs;
        });
      });
    },

    reset() {
      return set(base);
    },
  };

  return {
    subscribe,
    update,
    set,
    ...methods,
  };
};

export const BoardStore = boardsInit();
