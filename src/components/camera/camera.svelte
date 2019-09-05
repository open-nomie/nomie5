<script>
  // Svelte
  import { onMount, createEventDispatcher } from "svelte";

  //Vendors
  import CameraPhoto, {
    FACING_MODES,
    IMAGE_TYPES
  } from "jslib-html5-camera-photo";
  import domtoimage from "dom-to-image";

  // Modules
  import Storage from "../../modules/storage/storage";

  const dispatch = createEventDispatcher();

  export let show = false;

  let videoElement;
  let imgElement;
  let imgWrapper;
  let cameraPhoto;

  let state = {
    started: false,
    captured: undefined,
    saving: false
  };

  const methods = {
    capture() {
      state.captured = cameraPhoto.getDataUri({
        sizeFactor: 1,
        imageCompression: 0.75
      });
    },
    async clear() {
      state.captured = undefined;
      await cameraPhoto.stopCamera();
      await cameraPhoto.startCamera();
    },
    close() {
      methods.stop();
      state.captured = undefined;
      dispatch("close");
    },
    stop() {
      cameraPhoto.stopCamera();
      state.started = false;
    },
    save() {
      state.saving = true;
      setTimeout(() => {
        domtoimage.toJpeg(imgWrapper, { quality: 0.85 }).then(dataUrl => {
          state.saving = false;
          console.log("Image Captured", dataUrl.length);
          dispatch("photo", dataUrl);
          setTimeout(() => {
            methods.close();
          }, 120);
        });
      }, 120);
    },
    start() {
      cameraPhoto
        .startCamera()
        .then(() => {
          state.started = true;
        })
        .catch(e => {
          alert(e.message);
        });
    }
  };

  onMount(() => {
    cameraPhoto = new CameraPhoto(videoElement);
  });

  $: if (show === true && cameraPhoto) {
    methods.start();
  }
</script>

<style lang="scss">
  .camera {
    .visible {
      opacity: 1;
      transition: all 0.2s ease-in-out;
    }
    .hidden {
      transition: all 0.2s ease-in-out;
      opacity: 0;
      pointer-events: none;
      position: absolute;
    }
  }
  .camera-frame {
    border: solid 1px var(--color-solid-2);
    border-radius: 6px;
    height: 100vh;
    width: 100vw;
    max-width: 400px;
    max-height: 700px;
    background-color: #222;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    .buttons {
      position: absolute;
      bottom: 0;
      left: 16px;
      right: 16px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 16px;

      .btn {
        color: #fff;
        &:hover,
        &:active {
          color: rgba(255, 255, 255, 0.5);
        }
      }

      .btn-capture {
        $size: 60px;
        width: $size;
        height: $size;
        border-radius: $size * 0.5;
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        &:after {
          transition: all 0.2s ease-in-out;
          content: "";
          $size: 44px;
          width: $size;
          height: $size;
          border-radius: $size * 0.5;
          background-color: var(--color-red);
          display: block;
        }
        &:active {
          &:after {
            transition: all 0.2s ease-in-out;
            transform: scale(0.8);
          }
        }
      }
    }

    .camera-preview {
      position: relative;
      background-color: #000;
      width: 100%;
      height: 300px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.6);
      &.captured {
        background-color: transparent;
        box-shadow: none;
      }
      video {
      }
      .image-capture {
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.6);
        width: 300px;
        height: 300px;
        border: solid 6px #fff;
        background-size: cover;
        background-position: center center;
        &.saving {
          border: none;
          margin: 0 !important;
        }
      }
    }
  }
</style>

<div class="full-screen camera {show ? 'visible' : 'hidden'}">
  <div class="camera-frame">
    <div class="camera-preview {state.captured ? 'captured' : 'not-captured'}">

      <div
        class="image-capture {state.captured ? 'visible' : 'hidden'}
        {state.saving ? 'saving' : ''}"
        style="background-image:url({state.captured})"
        bind:this={imgWrapper} />

      <video
        class={state.captured ? 'hidden' : 'visible'}
        bind:this={videoElement}
        autoPlay="true"
        id="video"
        height="100%" />

    </div>
    <div class="buttons">
      <button
        class="btn btn-clear btn-icon zmdi zmdi-close"
        on:click={methods.close} />
      <div class="filler" />
      {#if state.started && !state.captured}
        <button class="btn-capture" on:click={methods.capture} />
      {:else if state.captured}
        <button
          class="btn btn-round btn-lg btn-primary w-50"
          on:click={methods.save}>
          Save
        </button>
      {:else}
        <button class="btn btn-clear" on:click={methods.start}>Start</button>
      {/if}
      <div class="filler" />

      {#if state.captured}
        <button
          class="btn btn-clear btn-icon zmdi zmdi-long-arrow-return"
          on:click={methods.clear} />
      {:else}
        <button
          class="btn btn-clear btn-icon {state.captured ? '' : 'zmdi zmdi-camera-party-mode'}" />
      {/if}
    </div>
  </div>
</div>
