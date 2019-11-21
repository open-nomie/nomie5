<script>
  import { onMount, onDestroy } from "svelte";
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  import math from "../../utils/math/math";
  import { UserStore } from "../../store/user";
  import { TrackerStore } from "../../store/trackers";
  import NNoteTextualizer from "../note-textualizer/note-textualizer.svelte";
  import Tracker from "../../modules/tracker/tracker";
  import TrackerButton from "../../containers/board/tracker-button.svelte";
  import Logo from "../logo/logo.svelte";
  import dayjs from "dayjs";
  import domtoimage from "dom-to-image-more";

  let boxDom;
  let noteDom;
  let trackers = {};
  let ready = false;
  let theme = "default";
  let themes = ["default", "pink", "blue", "dark", "green"];

  const methods = {
    randomTheme() {
      let index = themes.indexOf(theme);
      if (index < themes.length - 1) {
        theme = themes[index + 1];
      } else {
        theme = themes[0];
      }
    },
    capture() {
      domtoimage
        .toPng(boxDom)
        .then(function(dataUrl) {
          var link = document.createElement("a");
          link.download = `nomie-${dayjs().format("YYYY-DD-MM-H-mm")}.png`;
          link.href = dataUrl;
          link.click();
          Interact.closeShareImage();
        })
        .catch(function(error) {
          console.error("oops, something went wrong!", error);
        });
    },
    getIcons() {
      console.log("Get trackers", trackers);
      let logTrackers = $Interact.shareImage.log.trackersArray();
      return logTrackers.map(tagValue => {
        let pl = {};
        pl.tag = tagValue.tag;
        pl.value = tagValue.value;
        pl.tracker = trackers.hasOwnProperty(pl.tag) ? trackers[pl.tag] : null;
        pl.tracker =
          pl.tracker instanceof Tracker ? pl.tracker : new Tracker(pl.tracker);
        return pl;
      });
    },
    fontSize(str) {
      if (str.length < 40) {
        return 1.8;
      } else if (str.length >= 40 && str.length <= 70) {
        return 1.4;
      } else if (str.length >= 70 && str.length <= 140) {
        return 1.2;
      } else if (str.length > 140 && str.length <= 190) {
        return 1.1;
      } else if (str.length > 190 && str.length < 290) {
        return 1.0;
      } else if (str.length > 290 && str.length < 400) {
        return 0.8;
      } else {
        return 0.7;
      }
    },
    formatNote() {},
    resize() {
      boxDom.style.height = `${boxDom.offsetWidth}px`;
      noteDom.style.fontSize = `${methods.fontSize(
        $Interact.shareImage.log.note
      )}rem`;
      ready = true;
    }
  };
  onMount(() => {
    TrackerStore.subscribe(tkrs => {
      trackers = tkrs;
      ready = true;
      setTimeout(() => {
        methods.resize();
      }, 100);
    });
  });
</script>

{#if ready}
  <div class="share-image-component theme-{theme}">
    <div
      class="share-image-wrapper"
      bind:this={boxDom}
      on:click={methods.randomTheme}>
      <div class="date">
        <div class="day-date">
          {dayjs($Interact.shareImage.log.end).format(`MMMM D YYYY`)}
        </div>
        <div class="day-time">
          {dayjs($Interact.shareImage.log.end).format(`dddd ${$UserStore.is24Hour ? 'H:mm' : 'h:mm a'}`)}
        </div>
      </div>
      <div class="note" bind:this={noteDom}>
        {#if $Interact.shareImage.log.note.length}
          <NNoteTextualizer
            note={$Interact.shareImage.log.note}
            {trackers}
            className={'inherit'} />
        {/if}
      </div>
      <div class="trackers">
        {#each methods.getIcons() as payload}
          {#if payload.tracker}
            <div class="emoji-value">
              <span class="emoji">{payload.tracker.emoji}</span>
              <span class="label">{payload.tracker.label}</span>
              <span class="value">
                {payload.tracker.displayValue(payload.value)}
              </span>
            </div>
          {/if}
        {/each}
      </div>
      <Logo size="20" />
    </div>
    <div class="actions n-row">
      <button class="btn btn-clear" on:click={Interact.closeShareImage}>
        <i class="zmdi zmdi-close" />
      </button>
      <button class="btn btn-primary" on:click={methods.capture}>
        <i class="zmdi zmdi-download" />
      </button>
    </div>
  </div>
{/if}
