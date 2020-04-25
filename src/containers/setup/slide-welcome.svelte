<script>
  import TrackerButton from "../../containers/board/tracker-button.svelte";
  import { Interact } from "../../store/interact";
  import math from "../../utils/math/math";

  let testValue = 0;
  let positivity = -1;

  let emojis = ["😁", "😩", "😂", "😴", "🤯"];
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
      tracker={{ label: 'Tap Me!', emoji: emoji }}
      value={testValue}
      {positivity} />
    <h1 style="max-width:400px;" class="my-3 text-inverse">
      Track what (and who) you do, privately.
    </h1>
    <p class="text-inverse">
      <strong>100% private</strong>
      &
      <a href="https://github.com/open-nomie/nomie">open source.</a>
      Nomie was created because I needed a way to privately track my life -
      without giving up my precious data to some company.
      <a href="https://twitter.com/brandoncorbin">Brandon</a>
    </p>
  </div>
</section>
