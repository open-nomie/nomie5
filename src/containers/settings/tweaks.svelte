<script lang="ts">
  import NItem from "../../components/list-item/list-item.svelte";
  import { UserStore } from "../../store/user-store";
  import NToggle from "../../components/toggle-switch/toggle-switch.svelte";
  import { BoardStore } from "../../store/boards";
  import { Lang } from "../../store/lang";
  import { Interact } from "../../store/interact";
  // import Storage from "../storage/storage.svelte";
  import Storage from "../../modules/storage/storage";
  import Text from "../../components/text/text.svelte";
  import appConfig from "../../config/appConfig";
  import ButtonGroup from "../../components/button-group/button-group.svelte";
  import Button from "../../components/button/button.svelte";
  import { onMount } from "svelte";

  let fontSize = localStorage.getItem("font-size") || "md";

  let methods = {
    settingChange() {
      UserStore.saveMeta();
    },
    changeFontSize(size: "sm" | "md" | "lg") {
      if (["sm", "md", "lg"].indexOf(size) > -1) {
        localStorage.setItem("font-size", size);
        fontSize = size;
        document.body.classList.remove("font-size-lg", "font-size-sm", "font-size-md");
        document.body.classList.add(`font-size-${size}`);
      }
    },
  };
</script>

<!--
  *******************************************
  TWEAKS VIEW
  *******************************************
-->
<!-- Use Location -->

<div class="n-list pb-1">
  <NItem itemDivider>Style</NItem>
  <NItem title={Lang.t('settings.theme')}>
    <span slot="left">💡</span>
    <div slot="right">
      <select
        class="form-control"
        style="min-width:100px;width:100px"
        bind:value={$UserStore.theme}
        on:change={(event) => {
          UserStore.setTheme($UserStore.theme, $UserStore.theme_accent);
        }}>
        <option value="auto">Auto</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>

    </div>
  </NItem>
  <NItem title={Lang.t('settings.base-font-size', 'Base Font Size')}>
    <span slot="left">🅰</span>
    <div slot="right">
      <div class="btn-group">
        <Button
          icon
          className={`${fontSize === 'sm' ? 'btn-primary active' : ''}`}
          on:click={() => {
            methods.changeFontSize('sm');
          }}>
          <span style="font-size:9px">A</span>
        </Button>
        <Button
          icon
          className={`${fontSize === 'md' ? 'btn-primary active' : ''}`}
          on:click={() => {
            methods.changeFontSize('md');
          }}>
          <span style="font-size:13px">A</span>
        </Button>
        <Button
          icon
          className={`${fontSize === 'lg' ? 'btn-primary active' : ''}`}
          on:click={() => {
            methods.changeFontSize('lg');
          }}>
          <span style="font-size:16px">A</span>
        </Button>
      </div>
    </div>
  </NItem>

  <hr class="divider center" />

  <NItem title={Lang.t('settings.theme_accent', 'Color Accent')}>
    <span slot="left">🎨</span>
    <div slot="right">
      <select
        class="form-control"
        style="min-width:100px;width:100px"
        bind:value={$UserStore.theme_accent}
        on:change={(event) => {
          UserStore.setTheme($UserStore.theme, $UserStore.theme_accent);
        }}>
        <option value="default">Nomie</option>
        <option value="mint">Shamrock</option>
        <option value="teal">Seafoam</option>
        <option value="pink">KPop</option>
        <option value="orange">Fire</option>
        <option value="purple">Lilac</option>
      </select>
    </div>
  </NItem>

  <hr class="divider center my-1" />

  <NItem title={Lang.t('settings.small-tracker-buttons', 'Compact Tracker Buttons')}>
    <span slot="left">🐭</span>
    <div slot="right">
      <NToggle
        bind:value={$UserStore.localSettings.compactButtons}
        on:change={(change) => {
          UserStore.update((state) => {
            state.localSettings.compactButtons = change.detail === false ? false : true;
            localStorage.setItem(`${appConfig.data_root}/settings/compactButtons`, JSON.stringify(state.localSettings.compactButtons));
            return state;
          });
        }} />
    </div>
  </NItem>

  <hr class="divider center my-1" />

  <NItem title={Lang.t('settings.hide-tab-labels', 'Hide bottom tab labels')}>
    <span slot="left">🗂</span>
    <div slot="right">
      <NToggle bind:value={$UserStore.meta.hideLabels} on:change={methods.settingChange} />
    </div>
  </NItem>

  <hr class="divider center" />

  <NItem title={Lang.t('settings.hide-backup-reminder', 'Hide backup reminder')}>
    <span slot="left">📕</span>
    <div slot="right">
      <NToggle bind:value={$UserStore.meta.hideBackup} on:change={methods.settingChange} />
    </div>
  </NItem>
</div>

<!-- Tracker Board Tabs -->
<!-- {#if $BoardStore.boards.length == 0}
    <NItem title={Lang.t('settings.enable-boards')}>
      <span slot="left">🗂</span>
      <div slot="right">
        <NToggle bind:value={$UserStore.meta.boardsEnabled} on:change={methods.settingChange} />
      </div>
    </NItem>
  {/if} -->
<div class="n-list pb-2">
  <NItem itemDivider>Locale</NItem>
  <!-- 24 Hour -->

  <!-- firstDayOfWeek -->
  <NItem title={Lang.t('settings.first-day-of-week')}>
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

  <NItem title={Lang.t('settings.24-hour-clock')}>
    <span slot="left">⌚️</span>
    <div slot="right">
      <NToggle bind:value={$UserStore.meta.is24Hour} on:change={methods.settingChange} />
    </div>
  </NItem>

</div>
