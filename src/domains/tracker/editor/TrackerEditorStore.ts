import TrackerConfig from "../../../modules/tracker/tracker"
import { writable } from "svelte/store"
import type { Writable } from "svelte/store"
import NomieUOM from "../../../utils/nomie-uom/nomie-uom"
import math from "../../../utils/math/math"

type TrackerEditorType = {
  tracker?: TrackerConfig
  onComplete?: Function
  showEditor?: boolean
}

export const TrackerEditorStore: Writable<TrackerEditorType> = writable({
  tracker: undefined
})

export const closeTrackerEditor = () => {
  TrackerEditorStore.update(s => {
    s.showEditor = false;
    s.tracker = undefined;
    s.onComplete = undefined;
    return s;
  })
}

export const editTracker = (tracker?: TrackerConfig): Promise<TrackerConfig> => {
  console.log("editTracker()", tracker)
  tracker = tracker || new TrackerConfig({
    emoji: randomEmojis[math.random_range(0, randomEmojis.length - 1)]
  })
  return new Promise((resolve, reject) => {
    TrackerEditorStore.update(s => {
      s.tracker = tracker;
      s.showEditor = true;
      s.onComplete = () => {
        resolve(tracker);
      }
      return s;
    })
  })
}

export const groupedUOM = NomieUOM.toGroupedArray()

export const randomEmojis = [
  '😂',
  '❤️',
  '🥳',
  '🍦',
  '🌞',
  '🍹',
  '🎱',
  '😎',
  '🥫',
  '🍲',
  '🍩',
  '🐕',
  '🌵',
  '📗',
  '🏈',
  '🌸',
]
