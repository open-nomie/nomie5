<script>
  import TrackerButton from "../../containers/board/tracker-button.svelte";
  import { Interact } from "../../store/interact";
  import math from "../../utils/math/math";

  let testValue = 0;
  let positivity = -1;

  let emojis = ["😁", "😁", "💩", "❤️", "😂", "😴", "🤯"];
  let emoji = math.random(emojis);

  function testTrackerTap() {
    testValue++;
    if (testValue > 1 && testValue < 5) {
      positivity = 0;
    } else if (testValue > 4) {
      positivity = 1;
    }

    if (testValue == 10) {
      Interact.alert(
        "Someone likes to tap!",
        `This is an example of a sipmle tracker, there are other types inside.`
      );
    }
  }
</script>

<section class="slide slide-1 slide-welcome">
  <div class="top center-grow">
    <TrackerButton
      on:click={testTrackerTap}
      tracker={{ label: '', emoji: emoji }}
      value={testValue}
      {positivity} />
    <h1 style="max-width:400px;" class="my-3 text-inverse">
      Track your who,
      <br />
      what, & where
      <br />
      privately
    </h1>
    <p class="text-inverse">
      I needed a way to privately track my life - without handing over my data
      to some company, and Nomie was born.
      <br />
      <a href="https://twitter.com/brandoncorbin">Brandon</a>
      •
      <a href="https://github.com/open-nomie/nomie">Open Source</a>
    </p>
  </div>
</section>
