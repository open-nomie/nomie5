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

<section class="slide slide-1 slide-welcome">
  <div class="top center-grow mx-auto" style="max-width:320px; padding:16px;">
    <img src="/images/nomie-head-on.png" style="width:60%; max-width:300px;" alt="nomie-head-on" />
    <Text bold center lineHeightMd className="mt-4">
      Hi! I'm Nomie.
      <br />
      The completely private,
      <br />
      free & open life tracker.
    </Text>
    <Text size="xs" lineHeightMd center faded className="mt-2 mb-2">
      <Icon name="warning" size="14" />
      <strong>Terms</strong>
      Nomie is offered "as is", without warranty. Happy Data, LLC disclaims any liability for damanges resulting from using Nomie. Nomie is
      not a medical device, nor should it be used as such. MIT License
    </Text>
    <!-- <Text size="sm">
      By
      <a href="https://twitter.com/brandoncorbin">Brandon</a>
      See the
      <a href="https://github.com/open-nomie/nomie">Code</a>
    </Text> -->
  </div>
</section>
