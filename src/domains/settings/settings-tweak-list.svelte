<script lang="ts">
  import Input from '../../components/input/input.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import { UserStore } from '../../store/user-store'
  import NToggle from '../../components/toggle-switch/toggle-switch.svelte'
  import { Lang } from '../../store/lang'

  import appConfig from '../../config/appConfig'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Button from '../../components/button/button.svelte'
  import TinyColorPicker from '../../components/color-picker/tiny-color-picker.svelte'
  import List from '../../components/list/list.svelte'
  import Divider from '../../components/divider/divider.svelte'

  let fontSize = localStorage.getItem('font-size') || 'md'

  let methods = {
    settingChange() {
      UserStore.saveMeta()
    },
    changeFontSize(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
      if (['xs', 'sm', 'md', 'lg', 'xl'].indexOf(size) > -1) {
        localStorage.setItem('font-size', size)
        fontSize = size
        document.body.classList.remove(
          'font-size-xs',
          'font-size-lg',
          'font-size-sm',
          'font-size-xl',
          'font-size-md',
        )
        document.body.classList.add(`font-size-${size}`)
      }
    },
  }
</script>

<!--
  *******************************************
  TWEAKS VIEW
  *******************************************
-->
<!-- Use Location -->

<List
  title={Lang.t('general.style', 'Style')}
  outside
  className=" pb-1 lg:rounded-lg">
  <ListItem title={Lang.t('settings.theme', 'Theme')}>
    <span slot="left">💡</span>
    <div slot="right">
      <ButtonGroup>
        {#each ['light', 'dark', 'auto'] as theme}
          <Button
            style="padding:0 10px !important;"
            color=""
            size="sm"
            className={`${$UserStore.theme === theme ? 'btn-white active' : ''}`}
            on:click={() => {
              UserStore.setTheme(theme, $UserStore.theme_accent)
            }}>
            {Lang.t(`theme.${theme}`)}
          </Button>
        {/each}
      </ButtonGroup>
    </div>
  </ListItem>

  <hr class="divider center" />

  <!-- <ListItem title={Lang.t('settings.theme_accent', 'Accent')}>
    <span slot="left">🎨</span>
    <div slot="right">
      <TinyColorPicker
        className="mt-1"
        size={16}
        colors={['blue', 'mint', 'teal', 'pink', 'orange', 'purple']}
        value={$UserStore.theme_accent}
        on:change={(evt) => {
          UserStore.setTheme($UserStore.theme, evt.detail)
        }} />

    </div>
  </ListItem>

  <hr class="my-1 divider center" /> -->

  <!-- <ListItem title={Lang.t('settings.base-font-size', 'Text Size')}>
    <span slot="left">🅰</span>
    <div slot="right">
      <ButtonGroup>
        {#each ['xs', 'sm', 'md', 'lg', 'xl'] as size, index}
          <Button
            ariaLabel={`${size} font size`}
            className={`${fontSize === size ? 'active' : ''}`}
            on:click={() => {
              methods.changeFontSize(size)
            }}>
            <div style="font-size:{9 + index * 2}px;">A</div>
          </Button>
        {/each}

      </ButtonGroup>
    </div>
  </ListItem> -->

  <!-- <hr class="my-1 divider center" /> -->

  <!-- <ListItem
    title={Lang.t('settings.small-tracker-buttons', 'Compact Trackers')}>
    <span slot="left">🐭</span>
    <div slot="right">
      <NToggle
        bind:value={$UserStore.localSettings.compactButtons}
        on:change={(change) => {
          UserStore.update((state) => {
            state.localSettings.compactButtons = change.detail === false ? false : true
            localStorage.setItem(`${appConfig.data_root}/settings/compactButtons`, JSON.stringify(state.localSettings.compactButtons))
            return state
          })
        }} />
    </div>
  </ListItem> -->

  <!-- <hr class="my-1 divider center" /> -->

  <ListItem
    title={Lang.t('settings.hide-tab-labels', 'Hide bottom tab labels')}>
    <span slot="left">🗂</span>
    <div slot="right">
      <NToggle
        bind:value={$UserStore.meta.hideLabels}
        on:change={methods.settingChange} />
    </div>
  </ListItem>
</List>

<List outside title={Lang.t('settings.locale', 'Locale')} className="pb-2">
  <!-- 24 Hour -->

  <!-- firstDayOfWeek -->
  <ListItem title={Lang.t('settings.first-day-of-week', 'Week Starts On')}>
    <span slot="left">🗓</span>
    <div slot="right">
      <ButtonGroup>
        <Button
          className={`${$UserStore.meta.firstDayOfWeek === '1' ? 'active' : ''}`}
          on:click={() => {
            $UserStore.meta.firstDayOfWeek = '1'
            methods.settingChange()
          }}>
          {Lang.t('settings.sunday', 'Sunday')}
        </Button>
        <Button
          className={`${$UserStore.meta.firstDayOfWeek === '2' ? 'active' : ''}`}
          on:click={() => {
            $UserStore.meta.firstDayOfWeek = '2'
            methods.settingChange()
          }}>
          {Lang.t('settings.monday', 'Monday')}
        </Button>
      </ButtonGroup>
    </div>
  </ListItem>
  <!-- Language -->
  <ListItem title={Lang.t('settings.language', 'Language')}>
    <span slot="left">🌎</span>
    <div slot="right">
      <!-- <Input
        solo
        size="sm"
        type="select"
        bind:value={$Lang.lang}
        on:change={(event) => {
          Lang.setLang($Lang.lang)
        }}>
        {#each Lang.getLangs() as lang}
          <option value={lang.key}>{lang.label}</option>
        {/each}
      </Input> -->
      <select
        class="px-3 py-2 bg-gray-200 rounded-lg dark:bg-gray-900 dark:text-white"
        style="min-width:100px;width:100px"
        bind:value={$Lang.lang}
        on:change={(event) => {
          Lang.setLang($Lang.lang)
        }}>
        {#each Lang.getLangs() as lang}
          <option value={lang.key}>{lang.label}</option>
        {/each}
      </select>

    </div>
  </ListItem>

  <ListItem title={Lang.t('settings.24-hour-clock', '24 hour clock')}>
    <span slot="left">⌚️</span>
    <div slot="right">
      <NToggle
        bind:value={$UserStore.meta.is24Hour}
        on:change={methods.settingChange} />
    </div>
  </ListItem>
  <Divider center />
  <ListItem
    title={Lang.t('settings.translate-nomie', 'Help Translate Nomie')}
    to="/lang"
    detail>
    <span slot="left">🌍</span>
  </ListItem>

</List>
