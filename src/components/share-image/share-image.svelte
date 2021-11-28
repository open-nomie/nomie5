<script>
  import TrackerSmallBlock from './../tracker-small-block/tracker-small-block.svelte'
  import { onMount, onDestroy } from 'svelte'
  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'
  import { UserStore } from '../../store/user-store'
  import { TrackerStore } from '../../store/tracker-store'
  import NNoteTextualizer from '../note-textualizer/note-textualizer.svelte'
  import Logo from '../logo/logo.svelte'
  import NIcon from '../icon/icon.svelte'
  import dayjs from 'dayjs'
  import domtoimage from 'dom-to-image-more'
  import tick, { wait } from '../../utils/tick/tick'
  import extractor from '../../utils/extract/extract'
  import Button from '../button/button.svelte'
  import Backdrop from '../backdrop/backdrop.svelte'
  import TrackableElement, {
    toElement,
  } from '../../modules/trackable-element/trackable-element'

  let boxDom
  let noteDom
  let trackers = {}
  let ready = false
  let theme = 'default'
  let themes = ['default', 'pink', 'terminal', 'blue', 'dark', 'green']
  let downloading = false
  let generated = null
  let generating = false

  const methods = {
    randomTheme() {
      let index = themes.indexOf(theme)
      if (index < themes.length - 1) {
        theme = themes[index + 1]
      } else {
        theme = themes[0]
      }
      methods.generate()
    },
    async generate() {
      generating = true
      setTimeout(async () => {
        generated = await domtoimage.toPng(boxDom)
        generating = false
      }, 10)
    },
    // async copy() {
    //   try {
    //     // Get Image as Base64
    //     const base64Image = await methods.toImage()
    //     // Fetch the base64 - as a blob
    //     const res = await fetch(base64Image)
    //     const blob: any = await res.blob()
    //     // const item = new ClipboardItem({ 'image/png': blob })
    //     // Copy to clipboard
    //     navigator.clipboard.write([item])
    //     // Fire toast
    //     Interact.toast('Copied')
    //   } catch (e) {
    //     Interact.alert(Lang.t('general.error', 'Error'), e.message)
    //   }
    // },
    async toImage() {
      downloading = true
      await tick(120)
      return await domtoimage.toPng(boxDom)
    },
    async capture() {
      Interact.blocker(`Generating Image...`)
      downloading = true
      // Do it twice for good measure on iOS
      let image = await methods.toImage()
      image = await methods.toImage()
      // Generate a link that we can click
      var link = document.createElement('a')
      link.download = `nomie-${dayjs().format('YYYY-DD-MM-H-mm')}.png`
      link.href = image
      link.click()
      downloading = false
      Interact.closeShareImage()
      await wait(500)
      Interact.stopBlocker()
    },
    getIcons() {
      let logTrackers = $Interact.shareImage.log.getMeta().trackers
      return logTrackers
        .map((tagValue) => {
          let pl = {}
          pl.tag = tagValue.id
          pl.value = tagValue.value
          pl.tracker = $TrackerStore.trackers.hasOwnProperty(pl.tag)
            ? trackers[pl.tag]
            : null
          return pl
        })
        .filter((pl) => pl.tracker)
    },
    noteLength() {
      let parsed = extractor
        .parse($Interact.shareImage.log.note, { includeGeneric: true })
        .filter((row) => row.type != 'tracker')
      return parsed.length
    },
    resize() {
      if (boxDom.style) {
        // boxDom.style.height = `${boxDom.offsetWidth}px`
        noteDom.style.fontSize = `${methods.fontSize(
          $Interact.shareImage.log.note,
        )}em`
        ready = true
      }
    },
  }
  let trackUnsub
  onMount(() => {
    trackers = $TrackerStore.trackers
    ready = true
    setTimeout(() => {
      methods.resize()
      setTimeout(() => {
        methods.generate()
      }, 10)
    }, 100)
    // trackUnsub = TrackerStore.subscribe(tkrs => {

    // });
  })
  onDestroy(() => {
    // trackUnsub();
  })
</script>

<style global>
  .share-image-component {
    @apply bg-white dark:bg-black;
    @apply rounded-lg;
    @apply shadow-lg;
    @apply overflow-hidden;
    @apply flex-grow-0;
    @apply flex-shrink-0;
    @apply h-auto;
  }
  .share-image-component section {
    @apply w-80;
    @apply h-auto;
  }
  .share-image-component .note {
    @apply font-normal;
    @apply leading-snug;
    @apply mb-2;
  }
</style>

<Backdrop
  id="share-image"
  tappable
  on:close={() => {
    Interact.closeShareImage()
  }}
  className="px-4"
  visible={ready}>
  <div
    class="share-image-component {downloading ? 'downloading' : ''} theme-{theme}
    trackers-{methods.getIcons().length}
    {methods.noteLength() ? 'has-note' : 'no-note'}">
    <section class="p-2 bg-gray-200 dark:bg-gray-800">
      <div
        class="relative flex flex-col p-4 bg-white dark:bg-black share-image-wrapper"
        bind:this={boxDom}
        on:click={methods.randomTheme}>

        {#if $Interact.shareImage.log}
          <div class="flex items-center justify-between date stiff">
            <div class="text-lg font-bold day-time dark:text-gray-200">
              {dayjs($Interact.shareImage.log.end).fromNow()}
            </div>
            <div class="text-sm text-gray-400 day-date">
              {dayjs($Interact.shareImage.log.end).format(`${$UserStore.meta.is24Hour ? 'DD MMM YYYY' : 'MMM Do YYYY'}`)}
            </div>
          </div>

          <div class="flex items-center py-2 note filler" bind:this={noteDom}>
            {#if methods.noteLength()}
              <NNoteTextualizer
                note={$Interact.shareImage.log.note}
                {trackers}
                className={'inherit mt-0 font-bold leading-tight'} />
            {/if}
          </div>

          <div class="grid grid-cols-2 gap-4">
            {#each methods.getIcons() as payload}
              {#if payload.tracker}
                <TrackerSmallBlock
                  compact
                  element={toElement(payload.tracker.toNoteString(payload.value))} />
              {/if}
            {/each}
          </div>
          <Logo
            size={16}
            style="opacity:0.4"
            className="absolute bottom-2 right-2" />
        {/if}
      </div>
    </section>

    <div
      class="flex items-center justify-between px-4 pb-2 bg-gray-200 dark:bg-gray-800">
      <Button
        type="clear"
        className="text-primary-500"
        on:click={Interact.closeShareImage}>
        Close
      </Button>
      <Button
        type="clear"
        className=" text-primary-500"
        on:click={methods.capture}>
        Share
      </Button>
      <!-- <Button
        type="clear"
        size="lg"
        className="text-primary-500"
        on:click={methods.copy}>
        Copy
      </Button> -->

    </div>
  </div>
</Backdrop>
