<script>
  /**
   * Capture Log
   *
   * The Component used to construct a new log.
   *
   */

  // Svelte
  import { onDestroy, onMount } from "svelte";
  // import { slide } from "svelte/transition";

  // Modules
  import NomieLog from "../modules/nomie-log/nomie-log";
  import Storage from "../modules/storage/storage";

  //Components
  import NItem from "../components/list-item/list-item.svelte";
  import NIcon from "../components/icon/icon.svelte";
  import NCell from "../components/cell/cell.svelte";
  import NPoints from "../components/points/points.svelte";
  import dayjs from "dayjs";
  import md5 from "md5";
  import domtoimage from "dom-to-image-chrome-fix";
  import Dymoji from "../components/dymoji/dymoji.svelte";
  import AutoComplete from "../components/auto-complete/auto-complete.svelte";
  import NPositivitySelector from "../components/positivity-selector/positivity-selector.svelte";
  import NSpinner from "../components/spinner/spinner.svelte";

  // Utils
  import Logger from "../utils/log/log";
  import time from "../utils/time/time";
  import CalculateScore from "../utils/calculate-score/calculate-score";
  import TrackerInputer from "../modules/tracker/tracker-inputer";
  import tick from "../utils/tick/tick";
  import math from "../utils/math/math";

  // Stores
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/trackers";
  import { LedgerStore } from "../store/ledger";
  import { ActiveLogStore } from "../store/active-log";
  import { UserStore } from "../store/user";
  import { Lang } from "../store/lang";
  import { PeopleStore } from "../store/people-store";
  import { ContextStore } from "../store/context-store";

  // Consts
  const console = new Logger("capture-log");
  const isIOS =
    !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

  let textarea;
  let iOSFileInput;
  let saving = false;
  let saved = false;

  $: if ($LedgerStore.saving) {
    saving = true;
  } else {
    saving = false;
  }

  let state = {
    date: null,
    dateStarter: dayjs().format("YYYY-MM-DDTHH:mm"),
    score: 0,
    showCustomDate: false,
    autocompleteResults: null,
    cursorIndex: null,
    partialTag: null,
    advanced: false,
    dateFormated: null
  };

  function toggleAdvanced() {
    state.advanced = !state.advanced;
  }

  $: if ($ActiveLogStore.end) {
    let timeFormat = $UserStore.meta.is24Hour ? "HH:mm" : "h:mm a";
    let dateFormat = $UserStore.meta.is24Hour ? "MM/DD/YYYY" : "MMM D YYYY";
    state.dateFormated = dayjs($ActiveLogStore.end).format(
      `${dateFormat} ${timeFormat}`
    );
  }

  // TODO: Add a media/photo type of thing that can be added to a log..

  const methods = {
    setDate() {
      state.date = time.datetimeLocal(state.dateStarter);
      $ActiveLogStore.start = state.date.getTime();
      $ActiveLogStore.end = state.date.getTime();
      state.showCustomDate = false;
    },
    async selectDate() {
      let date = await Interact.selectDate(
        $ActiveLogStore.end ? new Date($ActiveLogStore.end) : new Date()
      );

      if (date) {
        await tick(10);
        ActiveLogStore.update(log => {
          log.end = date;
          return log;
        });
      }
    },
    clearDate() {
      state.date = null;
      $ActiveLogStore.start = null;
      $ActiveLogStore.end = null;
      state.showCustomDate = false;
    },
    clearLocation() {
      $ActiveLogStore.lat = null;
      $ActiveLogStore.lng = null;
      $ActiveLogStore.location = null;
    },
    toggleCustomDate() {
      if (state.date) {
        // They clicked it - solets clear it
        state.date = null;
      } else {
        state.showCustomDate = true;
      }
    },
    toggleCustomLocation() {
      if ($ActiveLogStore.lat) {
        $ActiveLogStore.lat = null;
        $ActiveLogStore.lng = null;
      } else {
        Interact.pickLocation().then(location => {
          $ActiveLogStore.lat = location.lat;
          $ActiveLogStore.lng = location.lng;
          $ActiveLogStore.location = location.name;
        });
      }
    },
    checkTextareaSize() {
      if (textarea) {
        textarea.style.height = "42px";
        let height = (textarea || {}).scrollHeight || 42;
        if (textarea && $ActiveLogStore.note.length > 0) {
          textarea.style.height = (height > 300 ? 300 : height) + "px";
        } else {
          textarea.style.height = "42px";
        }
        // Cal
        // methods.calculateScore();
      }
    },
    /**
     * Check for Auto Complete
     */
    autoCompleteSearch(searchTag, type = "tracker") {
      // Search for Trackers
      try {
        if (type == "tracker") {
          let tkrs = Object.keys($TrackerStore || {})
            .map(tag => {
              return $TrackerStore[tag];
            })
            .filter(trk => {
              return trk.tag.search(searchTag.replace("#", "")) > -1;
            });
          return tkrs.length ? tkrs : null;

          // Search for People
        } else if (type === "person") {
          try {
            let people = Object.keys($PeopleStore.people).filter(
              person =>
                person.toLowerCase().search(searchTag.replace("@", "")) > -1
            );
            return people.length
              ? people.map(username => {
                  return { tag: username, emoji: "👤", type: "person" };
                })
              : null;
          } catch (e) {
            console.error("Error Caught", e.message);
          }

          return null;

          // Search for Context
        } else if (type === "context") {
          let context = $ContextStore.filter(term => {
            let text = searchTag.replace("+", "").toLowerCase();
            term = term.toLowerCase();
            return term.search(text.toLowerCase()) > -1;
          });
          return context.length
            ? context.map(c => {
                return { tag: c, emoji: "💡", type: "context" };
              })
            : null;
        }
      } catch (e) {}
    },
    calculateScore() {
      $ActiveLogStore.score =
        $ActiveLogStore.score || CalculateScore($ActiveLogStore.note);
    },
    async logSave() {
      methods.calculateScore();
      await LedgerStore.saveLog($ActiveLogStore); // TODO: Make ledger task instead
      methods.clear();
    },
    async autocompleteText(text) {
      ActiveLogStore.update(s => {
        s.note = s.note.replace(state.partialTag, text + " ");
        return s;
      });
      await tick(1);
      document.getElementById("textarea-capture-note").focus();
      methods.autoCompleteDone();
    },
    async autoCompleteDone() {
      state.partialTag = null;
      state.cursorIndex = null;
      state.autocompleteResults = null;
    },

    keyPress(event) {
      if (event.key === "Enter" && event.getModifierState("Shift")) {
        event.preventDefault();
      } else {
        let value = event.target.value;
        let last = value.charAt(value.length - 1);
        if (last == " ") {
          state.autocompleteResults = null;
        } else if (value.length) {
          let arr = value.split(" ");
          let tag = arr[arr.length - 1];
          state.cursorIndex = arr.length - 1;
          // If its a tag
          if (tag.charAt(0) === "#" && tag.length > 1) {
            state.partialTag = tag;
            state.autocompleteResults = methods.autoCompleteSearch(
              tag,
              "tracker"
            );
            // If its a person
          } else if (tag.charAt(0) === "@" && tag.length > 1) {
            state.partialTag = tag;
            state.autocompleteResults = methods.autoCompleteSearch(
              tag,
              "person"
            );
            // If it's context
          } else if (tag.charAt(0) === "+" && tag.length > 1) {
            state.partialTag = tag;
            state.autocompleteResults = methods.autoCompleteSearch(
              tag,
              "context"
            );
          } else {
            state.partialTag = null;
            state.autocompleteResults = null;
          }
        } else {
          state.partialTag = null;
          state.autocompleteResults = null;
        }
      }
      methods.checkTextareaSize();
    },
    clear() {
      ActiveLogStore.clear();
      setTimeout(() => {
        state.date = null;
        state.autocompleteResults = null;
        state.advanced = false;
        state.cursorIndex = null;
        state.dateStarter = dayjs().format("YYYY-MM-DDTHH:mm");
        if (textarea) {
          textarea.style.height = "40px";
        }
      }, 120);
    },

    ifPopulated() {
      return (
        $ActiveLogStore.lat ||
        ($ActiveLogStore.note.trim() || "").length > 0 ||
        $ActiveLogStore.photo
      );
    }
  };

  // Clear the settings when saved
  LedgerStore.hook("onLogSaved", res => {
    methods.clear();
  });

  // When a tag is added by a button or other service
  ActiveLogStore.hook("onAddTag", res => {
    // add space to the end.
    setTimeout(() => {
      if (textarea) {
        textarea.value = textarea.value;
      }
      // adjust textarea size
      methods.checkTextareaSize();
    }, 10);
  });
</script>

<style lang="scss">
  @import "../scss/utils/__utils.scss";

  #note-capture {
    background-color: var(--color-solid);
  }

  .post-score {
    position: absolute;
    top: -10px;
    background-color: var(--color-solid);
    box-shadow: var(--box-shadow);
    padding: 2px 6px;
    border-radius: 4px;
  }
  .capture-log {
    // border-top: solid 1px rgba(0, 0, 0, 0.1);
    padding: 10px;
    // background-color: var(--header-background);
    // backdrop-filter: saturate(180%) blur(20px);
    // border-top: solid 1px var(--header-background);
    position: relative;
    z-index: 1;
  }

  .advanced {
    position: relative;
    z-index: 1200;
  }
  .autocomplete-results {
    background-color: var(--color-solid-1);
    margin: 0px;
    border-radius: 2px;
    padding: 2px;
    transition: all 0.2s ease-in-out;
    z-index: 100;
    &.animate {
      &.visible {
        transition: all 0.2s ease-in-out;
        opacity: 1;
      }
      &.hidden {
        max-height: 0px !important;
        padding: 0;
        overflow: hidden;
        margin: 0;
        transition: all 0.2s ease-in-out;
        opacity: 0;
        pointer-events: none;
        transform: translateY(60px);
      }
    }

    .tracker-list {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
    .btn {
      flex-grow: 1;
      flex-shrink: 1;
      box-shadow: var(--box-shadow-tight);
      background-color: var(--color-solid);
      color: var(--color-inverse-2);
      margin: 3px;
      font-size: 0.82rem;
      padding: 5px 6px;
    }
  }

  .more-options {
    position: relative;
    z-index: 130;
    padding: 0px 10px 10px;
    margin-top: -12px;
    // background-color: var(--header-background);

    .advanced-options-list {
      transition: all 0.2s ease-in-out;
      border: none !important;

      .btn-primary {
        background-color: var(--color-primary-bright);
        color: #fff;
      }
      &.hidden {
        height: 1px;
        overflow: hidden;
        opacity: 0;
      }
      &.visible {
        height: fit-content;
      }
    }
  }
  .advanced-toggle {
    background-color: transparent;
    color: var(--color-inverse);
    border: none;
    display: block;
    width: 100%;
    outline: none !important;
    transition: all 0.2s ease-in-out;

    &.active {
      color: $red;
      font-size: 33px;
    }
  }
  .save-progress {
    position: absolute;
    top: -4px;
    left: 0;
    height: 4px;
    background-color: $green;
    opacity: 0;
    width: 0px;
    transition: all 700ms ease-out;
    &.saving {
      background-color: $green;
      opacity: 1;
      width: 100%;
    }
    &.saved {
      transition: none;
      background-color: $green;
      opacity: 0;
      width: 0%;
    }
    &.clear {
      transition: none;
      width: 0;
    }
  }

  .save-button {
    padding: 0;
    width: 30px;
    height: 30px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    background-color: green;
    flex-grow: 0;
    flex-shrink: 0;
    margin-bottom: 6px;
    border: none;
    font-size: 0.9rem;
    color: #fff;
    svg {
      fill: #fff;
      height: 15px;
      width: 15px;
    }
  }
  .mask-textarea {
    display: flex;
    align-items: flex-end;
    min-height: 40px;
    max-height: 200px;
    border-radius: 20px;
    background-color: var(--input-background);
    // box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    transition: all 0.2s ease-in-out;
    border: solid 1px var(--color-faded-1);

    .save-button {
      display: none;
    }

    &.populated {
      background-color: rgba($green, 0.2);
      box-sizing: border-box;
      .save-button {
        display: inline-flex;
      }
    }

    textarea {
      // transition: all 0.2s ease-in-out;
      border: none;
      background-color: transparent;
      width: 100%;
      height: 40px;
      padding: 8px 0;
      color: var(--color-inverse-1);
      margin: 0 16px;
      font-size: 1rem;
      &:focus,
      &:active {
        outline: none;
      }
    }
  }
</style>

<div
  class="capture-wrapper"
  on:swipeup={methods.swipeUp}
  on:swipedown={methods.swipeDown}>

  <!-- 
    AUTO COMPLETE RESULTS
  -->

  <div class="capture-log">
    <div
      class="save-progress {saved ? 'saved' : ''}
      {saving ? 'saving' : ''}" />
    <div class="container p-0">

      <!-- Auto Complet e-->
      <AutoComplete
        input={$ActiveLogStore.note}
        on:select={async evt => {
          ActiveLogStore.updateNote(evt.detail.note);
          methods.checkTextareaSize();
          await tick(100);
          textarea.focus();
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }} />
      <!-- Note Input -->
      <div
        class="mask-textarea {$ActiveLogStore.lat || $ActiveLogStore.note.trim().length > 0 || $ActiveLogStore.photo ? 'populated' : 'empty'}">

        <textarea
          id="textarea-capture-note"
          style="overflow:hidden"
          disabled={saving || saved}
          bind:value={$ActiveLogStore.note}
          bind:this={textarea}
          placeholder={Lang.t('general.whats-up')}
          on:input={methods.keyPress}
          on:paste={methods.keyPress} />

        <button
          class="btn btn-clear btn-icon mr-1 {state.advanced ? 'text-green' : 'text-inverse'}"
          on:click={toggleAdvanced}>
          <NIcon
            name="more"
            className={state.advanced ? 'fill-green' : 'fill-inverse'} />
        </button>
        {#if !saving}
          <button class="save-button" on:click={methods.logSave}>
            <NIcon name="sendFilled" style="fill: #FFF;" size="16" />
          </button>
        {:else}
          <button class="save-button">
            <NSpinner size={20} color="#FFFFFF" />
          </button>
        {/if}
      </div>
    </div>

    {#if $ActiveLogStore.score}
      <div class="post-score">
        <NPoints points={$ActiveLogStore.score} />
      </div>
    {/if}

  </div>
  {#if state.advanced}
    <div class="advanced">
      <div class="container">
        <!-- Score -->
        <NItem compact className="bg-transparent">
          <div slot="left" class="text-sm text-bold">
            <NIcon name="star" className="mr-2 fill-primary-bright" size="16" />
            Score
          </div>
          <div slot="right" class="text-sm">
            <NPositivitySelector
              size="sm"
              score={$ActiveLogStore.score}
              on:change={evt => {
                $ActiveLogStore.score = evt.detail;
              }} />
          </div>
        </NItem>
        <!-- Location -->
        <NItem
          compact
          className="bg-transparent clickable mr-2"
          on:click={methods.toggleCustomLocation}>
          <div slot="left" class="text-sm text-bold">
            <NIcon name="pin" className="mr-2 fill-primary-bright" size="16" />
            Location
          </div>
          <div slot="right" class="n-row">
            {#if $ActiveLogStore.lat}
              <label class="text-sm ">
                {math.round($ActiveLogStore.lat, 100)},{math.round($ActiveLogStore.lng, 100)}
              </label>
              <button
                class="btn btn-clear btn-icon"
                on:click|stopPropagation={methods.clearLocation}>
                <NIcon name="close" className="fill-red" size="16" />
              </button>
            {:else if $UserStore.alwaysLocate}
              <label class="text-sm text-faded-3 ">Current Location</label>
            {:else}
              <label class="text-sm text-faded-3 ">None</label>
            {/if}
          </div>
        </NItem>
        <!-- Date / Time -->
        <NItem
          compact
          className="bg-transparent mt-1 mb-2 mr-2"
          on:click={methods.selectDate}>
          <div slot="left" class="text-sm text-bold">
            <NIcon name="time" className="mr-2 fill-primary-bright" size="16" />
            Date/Time
          </div>
          <div slot="right" class="n-row">
            {#if $ActiveLogStore.end}
              <label class="text-sm">{state.dateFormated}</label>
              <button
                class="btn btn-clear btn-icon"
                on:click|stopPropagation={methods.clearDate}>
                <NIcon name="close" className="fill-red" size="16" />
              </button>
            {:else}
              <label class="text-sm text-faded-3">Now</label>
            {/if}
          </div>
        </NItem>
      </div>
    </div>
  {/if}

</div>
