<script lang="ts">
  import { UserStore } from './../../store/user-store'
  import dayjs from 'dayjs'
  import { ChevronRight } from 'svelte-hero-icons'
  import { ChevronLeft } from 'svelte-hero-icons'
  import Icon from './../icon/icon.svelte'

  export let date: number

  const dateFormat = UserStore.getDateTimeFormat().shortDate

  let theDate = new Date()

  const dayMonth = $UserStore.meta.is24Hour ? 'DD/MM' : 'MM/DD'

  $: if (date && date !== theDate.getTime()) {
    theDate = new Date(date)
  } else if (!date && theDate.getTime()) {
    theDate = new Date()
  }

  const addDate = () => {
    theDate = dayjs(theDate).add(1, 'day').toDate()
    date = theDate.getTime()
  }
  const subtractDate = () => {
    theDate = dayjs(theDate).subtract(1, 'day').toDate()
    date = theDate.getTime()
  }
</script>

<style global>
  .stepper-button {
    @apply bg-white dark:bg-gray-500;
    @apply text-black;
    @apply shadow-sm;
    @apply rounded-md;
    @apply h-5;
    @apply border border-gray-500 border-opacity-40;
    @apply flex items-center;
  }
</style>

<div
  class="flex items-center text-xs space-x- date-stepper"
  aria-label="Control the Date">
  <button on:click={subtractDate} class="stepper-button">
    <Icon icon={ChevronLeft} size={14} />
  </button>
  <div
    class="w-12 font-semibold leading-none text-center"
    aria-label={dayjs(theDate).format(`${dayMonth} YYYY`)}>
    <div class="font-semibold dark:text-white">
      {dayjs(theDate).format(dayMonth)}
    </div>
    <div class="text-gray-500">{dayjs(theDate).format('YYYY')}</div>
  </div>
  <button on:click={addDate} class="stepper-button">
    <Icon icon={ChevronRight} size={14} />
  </button>
</div>
