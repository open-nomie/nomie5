<script lang="ts">
  import dayjs from "dayjs";
  import type { Dayjs } from "dayjs";
  import { UserStore } from "../../store/user-store";
  import NextPrevCal from "../next-prev-cal/next-prev-cal.svelte";
  import Text from "../text/text.svelte";

  export let date: Date | undefined;

  let localDate: Dayjs = dayjs();
  let dtFormat = UserStore.getDateTimeFormat();

  $: if (date) {
    localDate = dayjs(date);
  }
</script>

<div class="n-time-machine bg-inverse-1">
  <div class="flex container">
    <Text size="md" className="filler">{localDate.format(dtFormat.date)}</Text>
    <NextPrevCal hideCal={true} />
  </div>
</div>
