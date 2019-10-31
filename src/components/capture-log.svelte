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
    showCustomDate: false
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
    calculateScore() {
      $ActiveLogStore.score = CalculateScore($ActiveLogStore.note);
    },
    async logSave() {
      methods.calculateScore();
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
      setTimeout(() => {
        state.date = null;
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
        $ActiveLogStore.note.trim().length > 0 ||
        $ActiveLogStore.photo
      );
    },
    iOSCapture(event) {
      let input = event.target;
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.readAsDataURL(input.files[0]);
        reader.addEventListener("load", () => {
          const fileContent = reader.result;
          const path = `camera/${md5(fileContent)}`;
          methods.showPhotoEditor(fileContent);
        });
      }
    },
    showPhotoEditor(photoData) {
      state.showPhotoEditor = true;
      state.photoData = photoData;
      state.photoPath = `camera/${md5(photoData)}`;
    },
    photoEditor: {
      getTransform() {
        let transform = photoHolder.style.transform.trim().split(" ");
        let t = { rotate: 0, scaleX: 1 };
        transform.forEach(action => {
          if (action.search("rotate") > -1) {
            let deg = parseInt(action.replace(/(rotate\(|deg\)|;)/gi, ""));
            deg = isNaN(deg) ? 0 : deg;
            t.rotate = deg;
          } else if (action.search("scaleX") > -1) {
            let value = action.replace(/(scaleX\(|\)|;)/gi, "");
            t.scaleX = parseInt(value);
            t.scaleX = isNaN(t.scaleX) ? 1 : t.scaleX;
          }
        });
        return t;
      },
      toStyle(transform) {
        let style = `rotate(${transform.rotate}deg) scaleX(${transform.scaleX})`;
        return style;
      },
      attach() {
        if (photoHolder) {
          state.capturingEdits = true;
          setTimeout(() => {
            domtoimage
              .toJpeg(document.getElementById("final-image-data-container"))
              .then(dataUrl => {
                state.capturingEdits = false;
                state.finalImageData = dataUrl;
              })
              .catch(e => {
                console.log(e);
              });
          }, 2000);
        }

        // TODO see why domtoimage fails on iOS
      },
      flip() {
        if (photoHolder) {
          let transform = methods.photoEditor.getTransform();
          transform.scaleX = transform.scaleX === 1 ? -1 : 1;
          photoHolder.style.transform = methods.photoEditor.toStyle(transform);
        }
      },
      rotate() {
        if (photoHolder) {
          let transform = methods.photoEditor.getTransform();
          transform.rotate = transform.rotate + 90;
          photoHolder.style.transform = methods.photoEditor.toStyle(transform);
        }
      },
      cancel() {
        state.showPhotoEditor = false;
        state.photoData = null;
      }
    },
    capturePhoto() {
      Interact.openCamera(storagePath => {
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
    background-color: var(--color-solid);
    border-top: solid 1px var(--color-solid);
    position: relative;
    z-index: 1;
  }

  .more-options {
    position: relative;
    z-index: 130;
    padding: 0px 10px 10px;
    margin-top: -10px;
    .btn {
      background-color: transparent;
      display: flex;
      align-items: center;
      color: var(--color-solid-3);
      padding: 2px 6px;
      font-size: 0.8rem;
      line-height: 0.8rem;
      i {
        margin-right: 4px;
        font-size: 1rem;
        color: var(--color-solid-2);
      }
      &.btn-active {
        background-color: var(--color-inverse-1);
        color: var(--color-solid-1);
        i {
          color: var(--color-primary-bright);
        }
      }
      &.btn-close {
        i {
          color: var(--color-solid-3) !important;
          font-size: 26px;
        }
      }
    }
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
          placeholder={Lang.t('general.whats-up')}
          on:keypress={methods.keyPress}
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

    <!-- <NCell gap={1} className="py-2">
      <div class="filler" />
      {#if !state.date}
        <button
          class="btn btn-sm mr-1"
          on:click={() => {
            state.showCustomDate = true;
          }}>
          <i class="zmdi zmdi-calendar" />
          {Lang.t('general.date')}
        </button>
      {:else}
        <button
          class="btn btn-active btn-sm mr-1"
          on:click={() => {
            methods.clearDate();
          }}>
          <i class="zmdi zmdi-minus-circle text-white" />
          {Lang.t('general.date')}
        </button>
      {/if}

 
      {#if $ActiveLogStore.lat}
        <button
          class="btn btn-active btn-sm mr-2"
          on:click={() => {
            $ActiveLogStore.lat = null;
            $ActiveLogStore.lng = null;
          }}>
          <i class="zmdi zmdi-minus-circle text-white" />
          Location
        </button>
      {:else}
        <button
          class="btn btn btn-sm mr-2"
          on:click={() => {
            Interact.pickLocation().then(location => {
              $ActiveLogStore.lat = location.lat;
              $ActiveLogStore.lng = location.lng;
              $ActiveLogStore.location = location.name;
            });
          }}>
          <i class="zmdi zmdi-map" />
          Location
        </button>
      {/if}
      {#if $ActiveLogStore.score}
        <NPoints points={$ActiveLogStore.score} />
      {/if}

      <div class="filler" />
    </NCell> -->

    <!-- <button
      class="advanced-toggle {state.show ? 'active' : 'inactive'}"
      on:click={methods.advancedToggle}>
      •••
    </button> -->

    <div
      class="advanced-options-list {state.showCustomDate ? 'visible' : 'hidden'}">
      <div class="container pt-3 pb-1" style="max-width:320px">
        <div class="n-row">
          <div class="input-group flex-grow mr-1">
            <input
              name="note"
              type="datetime-local"
              class="form-control mt-0"
              style="font-size:16px; height:44px; overflow:hidden"
              bind:value={state.dateStarter} />
            <div class="input-group-append">
              <button class="btn btn-primary px-3" on:click={methods.setDate}>
                {Lang.t('general.set')}
              </button>
            </div>
          </div>
          <!-- end input-group -->
          <!-- And cancel button-->
          <button
            class="btn btn-clear btn-icon btn-close"
            on:click={() => {
              state.date = null;
              state.showCustomDate = false;
            }}>
            <i class="zmdi zmdi-close" />
          </button>
        </div>

      </div>
    </div>
    <!-- advacned options list -->

  </div>
</div>
<!-- {#if state.capturingEdits === true}
  <div class="photo-editor-window full-screen snap">
    <div
      class="photo-editor"
      id="final-image-data-container"
      style="overflow:hidden">
      <img
        alt="photo"
        src={state.photoData}
        id="final-image-data"
        bind:this={finalImage}
        width="600"
        height="600" />
    </div>
  </div>
{:else if state.finalImageData}
  <div class="photo-editor-window full-screen captured">
    <div class="photo-editor" style="overflow:hidden">
      <img
        alt="photo"
        src={state.finalImageData}
        bind:this={finalImage}
        width="400"
        height="400" />
    </div>
  </div>
{:else if state.showPhotoEditor && !state.capturingEdits}
  <div class="photo-editor-window full-screen dark-glass">
    <div class="photo-editor">
      <div
        class="photo"
        id="photo-editor-data"
        bind:this={photoHolder}
        style="background-image:url({state.photoData})">
        {#if state.finalImageData}
          <img src={state.finalImageData} width="100%" />
          f
        {:else}active image{/if}
      </div>
      <div class="n-row">
        <button
          class="btn btn-clear btn-icon zmdi zmdi-close"
          on:click={methods.photoEditor.cancel} />
        <div class="filler" />
        <button
          class="btn btn-clear btn-icon zmdi zmdi-rotate-right"
          on:click={methods.photoEditor.rotate} />
        <button
          class="btn btn-clear btn-icon zmdi zmdi-flip"
          on:click={methods.photoEditor.flip} />
        <div class="filler" />
        <button
          class="btn btn-clear btn-icon zmdi zmdi-check"
          on:click={methods.photoEditor.attach} />
      </div>
    </div>
  </div>
{/if} -->
