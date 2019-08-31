<script>
  /**
   * Capture Log
   *
   * The Component used to construct a new log.
   *
   */

  // Svelte
  import { onDestroy } from "svelte";
  // import { slide } from "svelte/transition";

  // Modules
  import NomieLog from "../modules/nomie-log/nomie-log";
  import Storage from "../modules/storage/storage";

  //Components
  import NItem from "../components/list-item/list-item.svelte";
  import dayjs from "dayjs";

  // Utils
  import Logger from "../utils/log/log";
  import time from "../utils/time/time";

  // Stores
  import { Interact } from "../store/interact";
  import { LedgerStore } from "../store/ledger";
  import { ActiveLogStore } from "../store/active-log";

  // Consts
  const console = new Logger("capture-log");
  const isIOS =
    !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

  let textarea;
  let saving = false;
  let saved = false;

  // Show saving animation when needed
  $: if ($LedgerStore.saving === false) {
    setTimeout(() => {
      saving = false;
      saved = true;
      setTimeout(() => {
        saved = false;
      }, 100);
    }, 400);
  } else {
    saving = true;
  }

  let state = {
    date: null,
    dateSet: false,
    show: false,
    showDate: false
  };

  // TODO: Add a media/photo type of thing that can be added to a log..

  const methods = {
    advancedChanged() {
      if (state.date) {
        ActiveLogStore.update(l => {
          let updatedDate = time.datetimeLocal(state.date);
          // alert(now + " " + gmtDate);
          // TODO: Mobile is getting GMT Time, desktop is not

          l.start = updatedDate.getTime();
          l.end = updatedDate.getTime();
          return l;
        });
      }
    },
    advancedToggle() {
      state.show = !state.show;
    },
    swipeUp() {
      state.show = true;
    },
    swipeDown() {
      state.show = false;
    },
    checkTextareaSize() {
      let height = (textarea || {}).scrollHeight || 40;
      if (textarea && $ActiveLogStore.note.length > 0) {
        textarea.style.height = (height > 300 ? 300 : height) + "px";
      } else {
        textarea.style.height = 40;
      }
    },
    async logSave() {
      await LedgerStore.saveLog($ActiveLogStore); // TODO: Make ledger task instead
      methods.clear();
    },
    keyPress(event) {
      if (event.key === "Enter" && event.getModifierState("Shift")) {
        event.preventDefault();
        methods.logSave();
      }
      methods.checkTextareaSize();
    },
    clear() {
      ActiveLogStore.clear();
      state.show = false;
      textarea.style.height = "40px";
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
        $ActiveLogStore.note.trim().length > 0 ||
        $ActiveLogStore.photo
      );
    },
    capturePhoto() {
      Interact.openCamera(storagePath => {
        console.log("Got it?", storagePath);
        ActiveLogStore.update(l => {
          l.photo = storagePath;
          return l;
        });
        // We have a base64 url of an image.. do somethign with it.
        // const path = `camera/${md5(payload)}`;
        // console.log(`Write payload ${payload.length} to ${path}`);
        // Storage.put(path, payload).then(() => {
        //   console.log("image Saved", path);
        //   ActiveLogStore.update(l => {
        //     l.photo = path;
        //     return l;
        //   });
        // });
      });
    }
  };

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
  .capture-log {
    border-top: solid 1px rgba(0, 0, 0, 0.1);
    padding: 10px;
    background-color: var(--color-solid);
    border-top: solid 1px var(--color-solid);
    box-shadow: 0px -2px 12px -4px rgba(0, 0, 0, 0.094);
    position: relative;
    padding-bottom: 0;
  }

  .more-options {
    position: relative;
    z-index: 130;
    padding: 0 12px;
    .n-list {
      padding-bottom: 10px;
      margin-top: -10px;
    }
    .advanced-options-list {
      transition: all 0.2s ease-in-out;
      &.hidden {
        height: 1px;
        overflow: hidden;
      }
      &.visible {
        height: 160px;
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
    &:focus,
    &:active,
    &:hover {
    }
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
    padding: 0 10px;
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
      opacity: 0;
      transition: all 0.2s ease-in-out;
    }

    &.populated {
      background-color: rgba($green, 0.2);
      box-sizing: border-box;
      .save-button {
        opacity: 1;
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
  <div class="capture-log">
    <div
      class="save-progress {saved ? 'saved' : ''}
      {saving ? 'saving' : ''}" />
    <div class="container p-0">
      <div
        class="mask-textarea {$ActiveLogStore.lat || $ActiveLogStore.note.trim().length > 0 || $ActiveLogStore.photo ? 'populated' : 'empty'}">
        <textarea
          style="overflow:hidden"
          disabled={saving || saved}
          bind:value={$ActiveLogStore.note}
          bind:this={textarea}
          placeholder="What's Up?"
          on:keypress={methods.keyPress}
          on:paste={methods.keyPress} />
        {#if !saving}
          <button class="save-button" on:click={methods.logSave}>Save</button>
        {:else}
          <button class="save-button">•••</button>
        {/if}
      </div>
    </div>
  </div>
  <div class="more-options">
    <button
      class="advanced-toggle {state.show ? 'active' : 'inactive'}"
      on:click={methods.advancedToggle}>
      •••
    </button>

    <div
      class="advanced-options-list n-list {state.show ? 'visible' : 'hidden'}">
      <div class="container py-2">

        {#if !state.dateSet}
          {#if state.date}
            <div class="n-row mb-2">
              <div class="input-group flex-grow mr-1">
                <input
                  name="note"
                  type="datetime-local"
                  class="form-control mt-0"
                  style="font-size:16px; height:44px; overflow:hidden"
                  on:input={() => {
                    methods.advancedChanged();
                  }}
                  bind:value={state.date} />
                <div class="input-group-append">
                  <button
                    class="btn btn-primary"
                    on:click={() => {
                      state.dateSet = true;
                    }}>
                    Set
                  </button>
                </div>
              </div>
              <!-- end input-group -->
              <!-- And cancel button-->
              <button
                class="btn btn-clear btn-icon"
                on:click={() => {
                  state.date = null;
                }}>
                <i class="zmdi zmdi-close" />
              </button>
            </div>
          {:else}
            <button
              class="btn btn-light btn btn-block"
              on:click={() => {
                state.date = dayjs().format('YYYY-MM-DDTHH:mm');
              }}>
              Set Custom Date
            </button>
          {/if}
        {:else}
          <button
            class="btn btn-danger btn btn-block"
            on:click={() => {
              state.date = null;
              state.dateSet = false;
            }}>
            Clear {dayjs(state.date).format('ddd MMM D YYYY h:mm a')}
          </button>
        {/if}

        {#if $ActiveLogStore.lat}
          <button
            class="btn btn-danger btn btn-block"
            on:click={() => {
              $ActiveLogStore.lat = null;
              $ActiveLogStore.lng = null;
            }}>
            Clear Location
          </button>
        {:else}
          <button
            class="btn btn-light btn btn-block"
            on:click={() => {
              Interact.pickLocation().then(location => {
                $ActiveLogStore.lat = location.lat;
                $ActiveLogStore.lng = location.lng;
              });
            }}>
            Set Custom Location
          </button>
        {/if}

        {#if !$ActiveLogStore.photo}
          {#if isIOS}
            <button
              disabled
              class="btn btn-light btn btn-block"
              on:click={() => {
                methods.iOSCapture();
              }}>
              Take a Photo iOS
            </button>
          {:else}
            <button
              disabled
              class="btn btn-light btn btn-block"
              on:click={() => {
                methods.capturePhoto();
              }}>
              Take a Photo
            </button>
          {/if}
        {:else}
          <button
            disabled
            class="btn btn-danger btn btn-block"
            on:click={() => {
              methods.removePhoto();
            }}>
            Remove Photo
          </button>
        {/if}

      </div>
    </div>
    <!-- advacned options list -->

  </div>
</div>
