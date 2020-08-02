<script>
  import NItem from "../../components/list-item/list-item.svelte";
  import { UserStore } from "../../store/user-store";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import { BoardStore } from "../../store/boards";
  import { Lang } from "../../store/lang";

  let methods = {
    settingChange() {
      UserStore.saveMeta();
    },
    async lockToggle() {
      if ($UserStore.meta.lock === true) {
        if (($UserStore.meta.pin || "").length == 0) {
          // TODO: figure out how to handle a cancel in the interact prompt
          let pin = await Interact.prompt(Lang.t("settings.pin-details"), null, {
            value: "",
            valueType: "number",
          });

          if (!pin) {
            $UserStore.meta.lock = false;
            $UserStore.meta.pin = null;
            UserStore.saveMeta();
          } else {
            $UserStore.meta.lock = true;
            $UserStore.meta.pin = pin;
            UserStore.saveMeta();
          }
        }
      } else {
        $UserStore.meta.lock = false;
        $UserStore.meta.pin = null;
        UserStore.saveMeta();
      }
    },
  };
</script>

<!--
              *******************************************
              TWEAKS VIEW 
              *******************************************
            -->
<div class="n-list solo">
  <NItem title={Lang.t('settings.theme')}>
    <div slot="right">
      <select
        class="form-control"
        style="min-width:100px;width:100px"
        bind:value={$UserStore.theme}
        on:change={(event) => {
          UserStore.setTheme($UserStore.theme);
        }}>
        <option value="auto">Auto</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>

    </div>
  </NItem>

  <!-- Use Location -->
  <NItem title={Lang.t('settings.use-location')}>

    <div slot="right">
      <NToggle
        bind:value={$UserStore.alwaysLocate}
        on:change={(event) => {
          UserStore.setAlwaysLocate(event.detail);
        }} />
    </div>
  </NItem>
  <NItem title={Lang.t('settings.small-tracker-buttons', 'Small Tracker Buttons')}>
    <div slot="right">
      <NToggle bind:value={$UserStore.meta.compactTrackerButtons} on:change={methods.settingChange} />
    </div>
  </NItem>
  <!-- Tracker Board Tabs -->
  {#if $BoardStore.boards.length == 0}
    <NItem title={Lang.t('settings.enable-boards')}>
      <div slot="right">
        <NToggle bind:value={$UserStore.meta.boardsEnabled} on:change={methods.settingChange} />
      </div>
    </NItem>
  {/if}
  <!-- Pin Code -->
  <NItem title={Lang.t('settings.require-pin')}>

    <div slot="right">
      <NToggle bind:value={$UserStore.meta.lock} on:change={methods.lockToggle} />
    </div>
  </NItem>
  <!-- 24 Hour -->
  <NItem title={Lang.t('settings.24-hour-clock')}>

    <div slot="right">
      <NToggle bind:value={$UserStore.meta.is24Hour} on:change={methods.settingChange} />
    </div>
  </NItem>
  <!-- Language -->
  <NItem title={Lang.t('settings.language')}>

    <div slot="right">
      <select
        class="form-control"
        style="min-width:100px;width:100px"
        bind:value={$Lang.lang}
        on:change={(event) => {
          Lang.setLang($Lang.lang);
        }}>
        {#each Lang.getLangs() as lang}
          <option value={lang.key}>{lang.label}</option>
        {/each}
      </select>

    </div>
  </NItem>

</div>
