<script>
  import { Interact } from '../../store/interact'
  import math from '../../utils/math/math'
  import config from '../../config/appConfig'
  import { onMount, onDestroy } from 'svelte'
  import Text from '../../components/text/text.svelte'
  import Icon from '../../components/icon/icon.svelte'

  let testValue = 0
  let positivity = -1

  let emojis = [
    '😁',
    '😁',
    '💩',
    '🌓',
    '😂',
    '😴',
    '🤯',
    '🙏',
    '⏰',
    '👨‍👨‍👧‍👧',
    '🥳',
    '🤬',
    '😈',
    '🍺',
    '😴',
    '🚬',
    '😍',
    '🐕‍🦺',
    '💃🏻',
    '💆‍♂️',
    '⛽️',
  ]
  let emoji = math.random(emojis)

  let emojiRotater

  onMount(() => {
    emojiRotater = setInterval(() => {
      emoji = math.random(emojis)
    }, 1200)
  })
  onDestroy(() => {
    clearInterval(emojiRotater)
  })

  function testTrackerTap() {
    testValue++
    if (testValue > 1 && testValue < 5) {
      positivity = 0
    } else if (testValue > 4) {
      positivity = 1
    }

    if (testValue == 10) {
      Interact.alert(
        'Someone likes to tap!',
        `This is an example of a sipmle tracker, there are other types inside.`,
      )
    }
  }
</script>

<section class=" slide slide-1 slide-welcome">
  <div
    class="flex flex-col items-center justify-center"
    style="max-width:320px; padding:16px;">
    <img
      src="/images/nomie-head-on.png"
      style="width:60%; max-width:300px;"
      alt="nomie-head-on" />
    <h1
      class="pt-2 text-2xl font-extrabold text-center md:text-4xl dark:text-white">
      👋 I'm Nomie
    </h1>
    <p
      class="my-4 text-xl leading-tight text-center md:text-2xl dark:text-gray-200">
      Original Mood and Life Tracker
    </p>

    <p
      class="mt-4 text-sm leading-6 text-center text-gray-700 dark:text-gray-400">
      <Icon name="warning" size={14} />
      <strong>Terms:</strong>
      Nomie is offered "as is", without warranty. Happy Data, LLC disclaims any
      liability for damages resulting from using Nomie. Nomie is not a medical
      device, nor should it be used as such. MIT License
    </p>
  </div>
</section>
