<script>
  /**
   * Capture Log
   *
   * The Component used to construct a new log.
   *
   */

  // Svelte
  import { slide } from "svelte/transition";

  // Modules
  import NomieLog from "../modules/nomie-log/nomie-log";

  //Components
  import NItem from "../components/list-item/list-item.svelte";
  import dayjs from "dayjs";

  // Utils
  import Logger from "../utils/log/log";

  // Stores
  import { Interact } from "../store/interact";
  import { LedgerStore } from "../store/ledger";
  import { ActiveLogStore } from "../store/active-log";

  // Consts
  const console = new Logger("capture-log");

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

  const methods = {
    advancedChanged() {
      if (state.date) {
        ActiveLogStore.update(l => {
          let now = new Date();
          let gmtDate = new Date(state.date);
          // TODO: Mobile is getting GMT Time, desktop is not
          // BUG
          if (now.getTimezoneOffset() !== gmtDate.getTimezoneOffset()) {
            alert("Timezone offset is not local");
          }
          l.start = gmtDate.getTime();
          l.end = gmtDate.getTime();
          return l;
        });
      }
    },
    advancedToggle() {
      state.show = !state.show;
    },
    checkTextareaSize() {
      let height = textarea.scrollHeight;
      textarea.style.height = (height > 300 ? 300 : height) + "px";
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

    .n-list {
      padding-bottom: 10px;
      margin-top: -10px;
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
    background-color: var(--color-faded);
    border: solid 1px var(--color-faded);
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

<div class="capture-log">
  <div class="save-progress {saved ? 'saved' : ''} {saving ? 'saving' : ''}" />
  <div class="container p-0">
    <div
      class="mask-textarea {$ActiveLogStore.note.trim().length ? 'populated' : 'empty'}">
      <textarea
        disabled={saving || saved}
        bind:value={$ActiveLogStore.note}
        bind:this={textarea}
        placeholder="What's Up?"
        on:keypress={methods.keyPress} />
      <button class="save-button" on:click={methods.logSave}>
        <i class="zmdi zmdi-long-arrow-up text-white" />
      </button>
    </div>
  </div>
</div>
<div class="more-options">
  <button
    class="advanced-toggle {state.show ? 'active' : 'inactive'}"
    on:click={methods.advancedToggle}>
    •••
  </button>
  {#if state.show}
    <div class="n-list" transition:slide>
      <div class="container py-2">

        {#if !state.dateSet}
          {#if state.date}
            <div class="n-row mb-2">
              <div class="input-group flex-grow mr-1">
                <input
                  type="datetime-local"
                  class="form-control mt-0"
                  style="font-size:0.8rem; height:44px;"
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

        <!-- <NItem className="">
          <button
            class="btn btn-light btn btn-block"
            on:click={() => {
              alert('Needs implemented');
            }}>
            Add a Photo
          </button>
        </NItem> -->
      </div>
    </div>
  {/if}

</div>
