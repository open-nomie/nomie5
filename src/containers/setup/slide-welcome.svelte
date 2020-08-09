<script>
  import TrackerButton from "../../containers/board/tracker-button.svelte";
  import { Interact } from "../../store/interact";
  import math from "../../utils/math/math";
  import config from "../../../config/global";
  import { onMount, onDestroy } from "svelte";

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
    }, 500);
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
  <div class="top center-grow">
    <TrackerButton on:click={testTrackerTap} tracker={{ label: '', emoji: emoji }} value={testValue} {positivity} />
    <h1 style="max-width:400px;" class="px-3 my-3 text-inverse">Privately track your life</h1>
    <p class="text-inverse px-3" style="line-height:150%">
      I needed a way to track my life - without giving my data to some company. I started building it in 2014, and nomie is the result.
      <br />
      <br />
      <a href="https://twitter.com/brandoncorbin" class="mb-1 d-block">By Brandon</a>
      <br />
      See the
      <a href="https://github.com/open-nomie/nomie">Code</a>

    </p>
  </div>
</section>
