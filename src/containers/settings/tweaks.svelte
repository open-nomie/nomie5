<script>
  import NItem from "../../components/list-item/list-item.svelte";
  import { UserStore } from "../../store/user-store";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import { BoardStore } from "../../store/boards";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";
  // import Storage from "../storage/storage.svelte";
  import Storage from "../../modules/storage/storage";
  import Text from "../../components/text/text.svelte";

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
  <NItem bottomLine title={Lang.t('settings.theme')}>
    <span slot="left">💡</span>
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
  <NItem bottomLine title={Lang.t('settings.use-location')}>
    <span slot="left">📍</span>
    <div slot="right">
      <NToggle
        bind:value={$UserStore.alwaysLocate}
        on:change={(event) => {
          UserStore.setAlwaysLocate(event.detail);
        }} />
    </div>
  </NItem>
  <NItem bottomLine title={Lang.t('settings.small-tracker-buttons', 'Small Tracker Buttons')}>
    <span slot="left">▪️</span>
    <div slot="right">
      <NToggle
        bind:value={$UserStore.localSettings.compactButtons}
        on:change={(change) => {
          UserStore.update((state) => {
            state.localSettings.compactButtons = change.detail === false ? false : true;
            Storage.local.put('settings/compactButtons', state.localSettings.compactButtons);
            return state;
          });
        }} />
    </div>
  </NItem>
  <!-- Tracker Board Tabs -->
  {#if $BoardStore.boards.length == 0}
    <NItem bottomLine title={Lang.t('settings.enable-boards')}>
      <span slot="left">🗂</span>
      <div slot="right">
        <NToggle bind:value={$UserStore.meta.boardsEnabled} on:change={methods.settingChange} />
      </div>
    </NItem>
  {/if}
  <!-- Pin Code -->
  <NItem bottomLine title={Lang.t('settings.require-pin')}>
    <span slot="left">🔒</span>
    <div slot="right">
      <NToggle bind:value={$UserStore.meta.lock} on:change={methods.lockToggle} />
    </div>
  </NItem>
  <!-- 24 Hour -->
  <NItem bottomLine title={Lang.t('settings.24-hour-clock')}>
    <span slot="left">⌚️</span>
    <div slot="right">
      <NToggle bind:value={$UserStore.meta.is24Hour} on:change={methods.settingChange} />
    </div>
  </NItem>
  <!-- firstDayOfWeek -->
  <NItem bottomLine title={Lang.t('settings.first-day-of-week')}>
    <span slot="left">🗓</span>
    <div slot="right">
      <select
        class="form-control"
        style="min-width:100px;width:100px"
        bind:value={$UserStore.meta.firstDayOfWeek}
        on:change={methods.settingChange}>
        <option value="1">{Lang.t('settings.sunday')}</option>
        <option value="2">{Lang.t('settings.monday')}</option>
      </select>
    </div>
  </NItem>
  <!-- Language -->
  <NItem title={Lang.t('settings.language')}>
    <span slot="left">🌎</span>
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
