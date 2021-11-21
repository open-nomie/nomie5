<script>
  import { Interact } from "../../store/interact";
  import math from "../../utils/math/math";
  import config from "../../config/appConfig";
  import { onMount, onDestroy } from "svelte";
  import Text from "../../components/text/text.svelte";
  import Icon from "../../components/icon/icon.svelte";

  let testValue = 0;
  let positivity = -1;

  let emojis = [
    "😁",
    "😁",
    "💩",
    "🌓",
    "😂",
    "😴",
    "🤯",
    "🙏",
    "⏰",
    "👨‍👨‍👧‍👧",
    "🥳",
    "🤬",
    "😈",
    "🍺",
    "😴",
    "🚬",
    "😍",
    "🐕‍🦺",
    "💃🏻",
    "💆‍♂️",
    "⛽️",
  ];
  let emoji = math.random(emojis);

  let emojiRotater;

  onMount(() => {
    emojiRotater = setInterval(() => {
      emoji = math.random(emojis);
    }, 1200);
  });
  onDestroy(() => {
    clearInterval(emojiRotater);
  });

  function testTrackerTap() {
    testValue++;
    if (testValue > 1 && testValue < 5) {
      positivity = 0;
    } else if (testValue > 4) {
      positivity = 1;
    }

    if (testValue == 10) {
      Interact.alert("Someone likes to tap!", `This is an example of a sipmle tracker, there are other types inside.`);
    }
  }
</script>

<section class="dark:bg-black slide slide-1 slide-welcome">
  <div class="flex flex-col items-center justify-center" style="max-width:320px; padding:16px;">
    <img src="/images/nomie-head-on.png" style="width:60%; max-width:300px;" alt="nomie-head-on" />
    <h1 class="text-4xl font-extrabold text-center pt-2">👋 I'm Nomie</h1>
    <p class="dark:text-gray-600 text-center text-2xl leading-tight my-2">The private, free and<br/>  open life tracker.</p>
    <Text size="xs" lineHeightMd center faded className="mt-2 mb-2">
      <Icon name="warning" size="14" />
      <strong>Terms:</strong>
      Nomie is offered "as is", without warranty. Happy Data, LLC disclaims any liability for damages resulting from using Nomie. Nomie is
      not a medical device, nor should it be used as such. MIT License
    </Text>
  </div>
</section>
