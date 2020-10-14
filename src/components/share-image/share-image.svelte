<script>
  import { onMount, onDestroy } from "svelte";
  import { Interact } from "../../store/interact";
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import { TrackerStore } from "../../store/tracker-store";
  import NNoteTextualizer from "../note-textualizer/note-textualizer.svelte";
  import Logo from "../logo/logo.svelte";
  import NIcon from "../icon/icon.svelte";
  import dayjs from "dayjs";
  import domtoimage from "dom-to-image-more";
  import tick from "../../utils/tick/tick";
  import extractor from "../../utils/extract/extract";
  import Button from "../button/button.svelte";

  let boxDom;
  let noteDom;
  let trackers = {};
  let ready = false;
  let theme = "default";
  let themes = ["default", "pink", "terminal", "blue", "dark", "green"];
  let downloading = false;
  let generated = null;
  let generating = false;

  const methods = {
    randomTheme() {
      let index = themes.indexOf(theme);
      if (index < themes.length - 1) {
        theme = themes[index + 1];
      } else {
        theme = themes[0];
      }
      methods.generate();
    },
    async generate() {
      generating = true;
      setTimeout(async () => {
        generated = await domtoimage.toPng(boxDom);
        generating = false;
      }, 10);
    },
    async copy() {
      try {
        // Get Image as Base64
        const base64Image = await methods.toImage();
        // Fetch the base64 - as a blob
        const res = await fetch(base64Image);
        const blob = await res.blob();
        const item = new ClipboardItem({ "image/png": blob });
        // Copy to clipboard
        navigator.clipboard.write([item]);
        // Fire toast
        Interact.toast("Copied");
      } catch (e) {
        Interact.alert(Lang.t("general.error", "Error"), e.message);
      }
    },
    async toImage() {
      downloading = true;
      await tick(120);
      return await domtoimage.toPng(boxDom);
    },
    async capture() {
      downloading = true;
      let image = await methods.toImage();
      var link = document.createElement("a");
      link.download = `nomie-${dayjs().format("YYYY-DD-MM-H-mm")}.png`;
      link.href = image;
      link.click();
      downloading = false;
      Interact.closeShareImage();
    },
    getIcons() {
      let logTrackers = $Interact.shareImage.log.getMeta().trackers;
      return logTrackers
        .map((tagValue) => {
          let pl = {};
          pl.tag = tagValue.id;
          pl.value = tagValue.value;
          pl.tracker = $TrackerStore.trackers.hasOwnProperty(pl.tag) ? trackers[pl.tag] : null;
          return pl;
        })
        .filter((pl) => pl.tracker);
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
    noteLength() {
      let parsed = extractor.parse($Interact.shareImage.log.note, { includeGeneric: true }).filter((row) => row.type != "tracker");
      return parsed.length;
    },
    resize() {
      if (boxDom.style) {
        boxDom.style.height = `${boxDom.offsetWidth}px`;
        noteDom.style.fontSize = `${methods.fontSize($Interact.shareImage.log.note)}em`;
        ready = true;
      }
    },
  };
  let trackUnsub;
  onMount(() => {
    trackers = $TrackerStore.trackers;
    ready = true;
    setTimeout(() => {
      methods.resize();
      setTimeout(() => {
        methods.generate();
      }, 10);
    }, 100);
    // trackUnsub = TrackerStore.subscribe(tkrs => {

    // });
  });
  onDestroy(() => {
    // trackUnsub();
  });
</script>

{#if ready && $Interact.shareImage.log}
  <div
    class="share-image-component {downloading ? 'downloading' : ''} theme-{theme} trackers-{methods.getIcons().length}
    {methods.noteLength() ? 'has-note' : 'no-note'}">

    <div class="share-image-wrapper" bind:this={boxDom} on:click={methods.randomTheme}>

      {#if generated && !generating}
        <!-- <img class="image-holder" alt="Download me!" src={generated} /> -->
      {/if}
      <div class="date">
        <div class="day-date">{dayjs($Interact.shareImage.log.end).format(`${$UserStore.is24Hour ? 'DD MMM YYYY' : 'MMM Do YYYY'}`)}</div>
        <div class="day-time">{dayjs($Interact.shareImage.log.end).fromNow()}</div>
      </div>
      <div class="note" bind:this={noteDom}>
        {#if methods.noteLength()}
          <NNoteTextualizer note={$Interact.shareImage.log.note} {trackers} className={'inherit mt-0'} />
        {/if}
      </div>
      <div class="trackers">
        {#each methods.getIcons() as payload}
          {#if payload.tracker}
            <div class="emoji-value">
              <span class="emoji">{payload.tracker.emoji}</span>
              <span class="label">{payload.tracker.label}</span>
              <span class="value">{payload.tracker.displayValue(payload.value)}</span>
            </div>
          {/if}
        {/each}
      </div>
      <Logo size="16" style="opacity:0.4" />
    </div>
    <div class="actions n-row">
      <Button shape="circle" color="transparent" on:click={Interact.closeShareImage}>
        <NIcon name="close" className="fill-white" />
      </Button>
      <Button size="lg" className="mx-1" shape="circle" on:click={methods.capture}>
        <NIcon name="share" className="fill-white" />
      </Button>
      <Button size="lg" className="mx-1" shape="circle" on:click={methods.copy}>
        <NIcon name="copy" className="fill-white" />
      </Button>
      <Button shape="circle" color="transparent" on:click={methods.randomTheme}>
        <NIcon name="refresh" className="fill-white" />
      </Button>
    </div>
  </div>
{/if}
