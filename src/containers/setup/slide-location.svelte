<script>
  import { Lang } from "../../store/lang";
  import { UserStore } from "../../store/user-store";
  import NItem from "../../components/list-item/list-item.svelte";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import NIcon from "../../components/icon/icon.svelte";

  const state = {
    theme: "auto",
  };
</script>

<section class="slide slide-location">
  <div class="top center-grow pt-3">

    <h1 class="mt-4">{Lang.t('setup.use-location', `Enable Location data when you track?`)}</h1>
    <div style="max-width:400px; margin:8pt auto;">
      <NItem className="solo mx-0 w-100">
        <div slot="left">
          <NIcon name="pin" />
        </div>
        Location Tracking
        <div slot="right">
          <NToggle
            bind:value={$UserStore.alwaysLocate}
            on:change={(event) => {
              UserStore.setAlwaysLocate(event.detail);
            }} />
        </div>
      </NItem>
    </div>
  </div>

</section>
