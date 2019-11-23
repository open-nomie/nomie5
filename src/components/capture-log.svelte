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
  import NCell from "../components/cell/cell.svelte";
  import NPoints from "../components/points/points.svelte";
  import dayjs from "dayjs";
  import md5 from "md5";
  import domtoimage from "dom-to-image-chrome-fix";

  // Utils
  import Logger from "../utils/log/log";
  import time from "../utils/time/time";
  import CalculateScore from "../utils/calculate-score/calculate-score";
  import TrackerInputer from "../modules/tracker/tracker-inputer";

  // Stores
  import { Interact } from "../store/interact";
  import { TrackerStore } from "../store/trackers";
  import { LedgerStore } from "../store/ledger";
  import { ActiveLogStore } from "../store/active-log";
  import { UserStore } from "../store/user";
  import { Lang } from "../store/lang";

  // Consts
  const console = new Logger("capture-log");
  const isIOS =
    !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

  let textarea;
  let iOSFileInput;
  let photoHolder;
  let finalImage;
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
    capturingEdits: false,
    photoData: null,
    finalImageData: null,
    score: 0,
    showCustomDate: false,
    autocompleteResults: null,
    cursorIndex: null
  };

  // TODO: Add a media/photo type of thing that can be added to a log..

  const methods = {
    setDate() {
      state.date = time.datetimeLocal(state.dateStarter);
      $ActiveLogStore.start = state.date.getTime();
      $ActiveLogStore.end = state.date.getTime();
      state.showCustomDate = false;
    },
    clearDate() {
      state.date = null;
      $ActiveLogStore.start = null;
      $ActiveLogStore.end = null;
      state.showCustomDate = false;
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
        let height = (textarea || {}).scrollHeight || 40;
        if (textarea && $ActiveLogStore.note.length > 0) {
          textarea.style.height = (height > 300 ? 300 : height) + "px";
        } else {
          textarea.style.height = 40;
        }
        // Cal
        methods.calculateScore();
      }
    },
    checkForAutocomplete(searchTag) {
      let tkrs = Object.keys($TrackerStore || {})
        .map(tag => {
          return $TrackerStore[tag];
        })
        .filter(trk => {
          return trk.tag.search(searchTag.replace("#", "")) > -1;
        });
      return tkrs.length ? tkrs : null;
    },
    calculateScore() {
      $ActiveLogStore.score = CalculateScore($ActiveLogStore.note);
    },
    async logSave() {
      methods.calculateScore();
      await LedgerStore.saveLog($ActiveLogStore); // TODO: Make ledger task instead
      methods.clear();
    },
    autocompleteTracker(tracker) {
      let inputer = new TrackerInputer(tracker);
      inputer
        .get()
        .then(() => {
          // Replace the original search tag
          let note = $ActiveLogStore.note.split(" ");
          note = note.filter((word, index) => index !== state.cursorIndex);
          ActiveLogStore.updateNote(note.join(" ") + " ");
          state.cursorIndex = null;
          state.autocompleteResults = null;
          if (textarea) {
            textarea.focus();
          }
        })
        .catch(e => {
          console.log("ERror caught", e.message);
        });
    },
    keyPress(event) {
      if (event.key === "Enter" && event.getModifierState("Shift")) {
        event.preventDefault();
      } else {
        let value = event.target.value;
        let last = value.charAt(value.length - 1);
        if (last == " ") {
          state.autocompleteResults = null;
        } else {
          let arr = value.split(" ");
          let tag = arr[arr.length - 1];
          state.cursorIndex = arr.length - 1;
          if (tag.charAt(0) === "#" && tag.length > 1) {
            state.autocompleteResults = methods.checkForAutocomplete(tag);
          }
        }
      }
      methods.checkTextareaSize();
    },
    clear() {
      ActiveLogStore.clear();
      setTimeout(() => {
        state.date = null;
        state.autocompleteResults = null;
        state.cursorIndex = null;
        state.dateStarter = dayjs().format("YYYY-MM-DDTHH:mm");
        if (textarea) {
          textarea.style.height = "40px";
        }
      }, 120);
    },
    removePhoto() {
      let path = $ActiveLogStore.photo;
      Storage.delete(path).then(() => {
        ActiveLogStore.update(l => {
          l.photo = null;
          return l;
        });
      });
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
        textarea.value = textarea.value + " ";
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
    border-top: solid 1px rgba(0, 0, 0, 0.1);
    padding: 10px;
    background-color: var(--header-background);
    border-top: solid 1px var(--header-background);
    position: relative;
    z-index: 1;
  }

  .more-options {
    position: relative;
    z-index: 130;
    padding: 0px 10px 10px;
    margin-top: -12px;
    background-color: var(--header-background);
    // .btn {
    //   background-color: transparent;
    //   display: flex;
    //   align-items: center;
    //   color: var(--color-solid-3);
    //   padding: 2px 6px;
    //   font-size: 0.8rem;
    //   line-height: 0.8rem;
    //   i {
    //     margin-right: 4px;
    //     font-size: 1rem;
    //     color: var(--color-solid-2);
    //   }
    //   &.btn-active {
    //     background-color: var(--color-inverse-1);
    //     color: var(--color-solid-1);
    //     i {
    //       color: var(--color-primary-bright);
    //     }
    //   }
    //   &.btn-close {
    //     i {
    //       color: var(--color-solid-3) !important;
    //       font-size: 26px;
    //     }
    //   }
    // }
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

  .photo-editor {
    background-color: var(--color-solid);
    border-radius: 8px;
    box-shadow: 0px 10px 20px -6px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    margin: 10px;
    .photo {
      width: 300px;
      height: 300px;
      overflow: hidden;
      background-position: center center;
      background-size: cover;
    }
    .n-row {
      padding: 6px 16px 6px 6px;
      color: var(--color-inverse);
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
    background-color: var(--color-faded-1);
    overflow: hidden;
    transition: all 0.2s ease-in-out;

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

  <div
    class="autocomplete-results animate {state.autocompleteResults ? 'visible' : 'hidden'}">
    <div class="container p-0 tracker-list">
      {#each state.autocompleteResults || [] as tracker (tracker.tag)}
        <button
          class="btn btn-tracker-inline"
          on:click={() => {
            methods.autocompleteTracker(tracker);
          }}>
          {tracker.emoji} {tracker.tag}
        </button>
      {/each}
      <div class="filler" />
    </div>
  </div>

  <div class="capture-log">
    <div
      class="save-progress {saved ? 'saved' : ''}
      {saving ? 'saving' : ''}" />
    <div class="container p-0">

      <!-- Auto Complet e-->

      <!-- Note Input -->
      <div
        class="mask-textarea {$ActiveLogStore.lat || $ActiveLogStore.note.trim().length > 0 || $ActiveLogStore.photo ? 'populated' : 'empty'}">
        <textarea
          style="overflow:hidden"
          disabled={saving || saved}
          bind:value={$ActiveLogStore.note}
          bind:this={textarea}
          placeholder={Lang.t('general.whats-up')}
          on:input={methods.keyPress}
          on:paste={methods.keyPress} />

        <button
          class="btn btn-clear btn-icon zmdi zmdi-time px-1 {state.date ? 'text-green' : ''}"
          on:click={methods.toggleCustomDate} />
        <button
          class="btn btn-clear btn-icon zmdi zmdi-my-location px-1 {$ActiveLogStore.lat ? 'text-green' : ''}
          mr-1"
          on:click={methods.toggleCustomLocation} />

        {#if !saving}
          <button class="save-button" on:click={methods.logSave}>
            <i class="zmdi zmdi-long-arrow-up" />
          </button>
        {:else}
          <button class="save-button">•••</button>
        {/if}
      </div>
    </div>

    {#if $ActiveLogStore.score}
      <div class="post-score">
        <NPoints points={$ActiveLogStore.score} />
      </div>
    {/if}

  </div>
  <div class="more-options">
    <div
      class="advanced-options-list {state.showCustomDate ? 'visible' : 'hidden'}">
      <div class="container pt-3 pb-1" style="max-width:520px">
        <div class="n-row">
          <button
            class="btn btn-white btn-sm mr-1 btn-icon zmdi zmdi-chevron-left
            box-shadow-float"
            on:click={() => {
              state.date = null;
              state.showCustomDate = false;
            }} />
          <input
            name="note"
            type="datetime-local"
            class="form-control mt-0 filler"
            style="font-size:16px;"
            bind:value={state.dateStarter} />
          <button
            class="btn btn-primary btn-sm mr-1 ml-2 px-3"
            on:click={methods.setDate}>
            {Lang.t('general.set')}
          </button>
          <!-- end input-group -->
          <!-- And cancel button-->

        </div>

      </div>
    </div>
    <!-- advacned options list -->

  </div>
</div>
