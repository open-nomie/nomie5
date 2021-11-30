import TrackableElement, {
  toElement,
} from "../../modules/trackable-element/trackable-element";
import { writable } from "svelte/store";
import { wait } from "../../utils/tick/tick";
import dayjs, { Dayjs } from "dayjs";

type StatsStoreState = {
  trackables: Array<TrackableElement>;
  showModal: boolean;
  date: Dayjs;
};

function createStatsStore() {
  const stateBase: StatsStoreState = {
    trackables: [],
    showModal: false,
    date: dayjs(),
  };
  const { subscribe, set, update } = writable(stateBase);

  return {
    subscribe,
    update,
  };
}

/**
 * Main Export
 */
export const StatsStore = createStatsStore();

/**
 * Open the Stats Modal
 * @param ele
 * @param date
 */
export const openStats = async (
  ele: TrackableElement | string,
  date?: Dayjs
) => {
  // Convert either string or trackable to trackable
  const element: TrackableElement =
    ele instanceof TrackableElement ? ele : toElement(ele);
  // Update the state
  StatsStore.update((s: StatsStoreState) => {
    if (!s.trackables.find((t: TrackableElement) => t.id == element.id)) {
      s.trackables.push(element);
    }
    if (date) {
      s.date = date;
    }
    return s;
  });
  // Give time for ui to do Animation
  await wait(300);
  StatsStore.update((s) => {
    s.showModal = true;
    return s;
  });
};

/**
 * Clear the Stats Store close Modal
 */
export const closeStats = async () => {
  StatsStore.update((s) => {
    s.showModal = false;
    return s;
  });
  // Give time for ui to do Animation
  await wait(300);
  StatsStore.update((s) => {
    s.trackables = [];
    return s;
  });
};

export const setStatsDate = (date: Dayjs) => {
  StatsStore.update((s) => {
    s.date = date;
    return s;
  });
};
