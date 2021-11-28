<script lang="ts">
  import Spinner from './spinner/spinner.svelte'
  import { wait } from './../utils/tick/tick'
  import { createEventDispatcher } from 'svelte'
  import IonIcon from './icon/ion-icon.svelte'
  import CameraSolid from 'ionicons/dist/svg/camera.svg?component'
  import html2canvas from 'html2canvas'

  const dispatch = createEventDispatcher()

  export let className: string = ''
  export let renderSize: number = 90
  export let size: number = 90
  export let compression: number = 0.2
  export let original: string | undefined = undefined

  let raw: string | undefined = undefined
  let loading: boolean = false
  let rendered: string | undefined = undefined

  const capture = async () => {
    rendered = undefined
    const field = document.getElementById('image-capture-field')
    field.click()
  }

  function readImage(file: File) {
    let reader = new FileReader()
    try {
      reader.onload = async (theFile: any) => {
        loading = true
        raw = theFile.target.result
        captureCroppedVersion()

        //
      }
      reader.readAsDataURL(file)
    } catch (e) {
      alert(e)
      // Interact.error(e.message)
    }
  }

  async function captureCroppedVersion() {
    const wrapper: any = document.getElementById('photo-holder')
    const _image: any = document.getElementById('photo-holder-image')

    await wait(500)

    try {
      await wait(400)
      let canvas = await html2canvas(_image, {
        width: renderSize,
        height: renderSize,
      })
      rendered = canvas.toDataURL('image/jpeg', compression)
      dispatch('image', rendered)
    } catch (e) {
      alert(e.message)
    }
    loading = false
  }
</script>

<style lang="postcss" global>
  .image-capture {
    @apply flex items-center justify-center;
    @apply p-4 rounded-lg;
    @apply bg-gray-400 dark:bg-gray-600;
    @apply text-gray-500 dark:text-gray-300;
    @apply hover:bg-primary-500 text-white;
    @apply transition-colors;
    @apply duration-150;
    @apply ring-2 ring-gray-200 dark:ring-gray-800;
  }
  .image-capture.filled {
    @apply ring-2 ring-primary-500;
  }
</style>

<button
  aria-label="Capture a photo"
  on:click={capture}
  class="image-capture bg-cover bg-center text-gray-700 {className}
  {rendered ? 'filled' : 'empty'}
  "
  style="{rendered || original ? `background-image:url(${rendered || original});` : ''}
  height:{size}px; width:{size}px;">
  {#if !rendered}
    {#if loading}
      <Spinner size={size * 0.6} />
    {:else if !original}
      <IonIcon icon={CameraSolid} />
    {/if}
  {/if}
  <input
    type="file"
    class="hidden"
    id="image-capture-field"
    on:change={(evt) => {
      let files = evt.target.files
      readImage(files[0])
    }} />
</button>

{#if !rendered}
  <div
    id="photo-holder"
    class="bg-white "
    style="overflow:hidden; height:0; width:0;">
    <div
      id="photo-holder-image"
      class="flex flex-grow-0 flex-shrink-0 bg-center bg-cover"
      style="height:{renderSize}px; width:{renderSize}px; background-image:url({raw})" />
  </div>
{/if}
