<script lang="ts">
  import Backdrop from '../../components/backdrop/backdrop.svelte'
  import PositivitySelector from './../positivity-selector/positivity-selector.svelte'
  import Container from './../container/container.svelte'
  /**
   * Capture Log
   *
   * The Component used to construct a new log.
   *
   */

  // Svelte
  import { onDestroy, onMount } from 'svelte'
  import _ from 'lodash'
  // import { slide } from "svelte/transition";
  import DateTimeBar from '../date-time-bar/date-time-bar.svelte'
  import './capture-log.css'
  //Components
  import NItem from '../list-item/list-item.svelte'
  import NIcon from '../icon/icon.svelte'
  import Button from '../button/button.svelte'
  import dayjs from 'dayjs'
  import type { OpUnitType, Dayjs } from 'dayjs'

  import AutoComplete from '../auto-complete/auto-complete.svelte'
  import NSpinner from '../spinner/spinner.svelte'

  // Utils
  import Logger from '../../utils/log/log'
  import ScoreNote from '../../modules/scoring/score-note'
  import tick from '../../utils/tick/tick'
  import math from '../../utils/math/math'

  // Stores
  import { Interact } from '../../store/interact'
  import { TrackerStore } from '../../store/tracker-store'
  import { LedgerStore } from '../../store/ledger'
  import { ActiveLogStore } from '../../store/active-log'
  import { UserStore } from '../../store/user-store'
  import { Lang } from '../../store/lang'
  import { PeopleStore } from '../../store/people-store'
  import { ContextStore } from '../../store/context-store'
  import Text from '../text/text.svelte'
  import PositivityMenu from '../positivity-selector/positivity-menu.svelte'
  import Icon from '../icon/icon.svelte'
  import DatePicker from '../date-picker/date-picker.svelte'
  import type TrackableElement from '../../modules/trackable-element/trackable-element'
  import extract from '../../utils/extract/extract'
  import { getEmojiFromScore } from '../../utils/positivity/positivity'
  import Log from '../../utils/log/log'

  // Consts
  const console = new Logger('capture-log')
  const isIOS =
    !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)

  let textarea
  let iOSFileInput
  let saving = false
  let saved = false
  let debounce
  let textareaTimeout
  let isFocused = false
  let showPositivitySelector = false
  // let activeLogDayjs: Dayjs;

  $: if ($LedgerStore.saving) {
    saving = true
  } else {
    saving = false
  }

  let state = {
    date: null,
    dateStarter: dayjs().format('YYYY-MM-DDTHH:mm'),
    score: 0,
    // showCustomDate: false,
    autocompleteResults: null,
    cursorIndex: null,
    partialTag: null,
    advanced: false,
    dateFormated: null,
  }

  function toggleAdvanced() {
    state.advanced = !state.advanced
  }

  $: if ($ActiveLogStore.end) {
    let timeFormat = $UserStore.meta.is24Hour ? 'HH:mm' : 'h:mm a'
    let dateFormat = $UserStore.meta.is24Hour ? 'MM/DD/YYYY' : 'MMM D YYYY'
    state.dateFormated = dayjs($ActiveLogStore.end).format(
      `${dateFormat} ${timeFormat}`,
    )
    // activeLogDayjs = dayjs($ActiveLogStore.end);
  }

  const methods = {
    dateAdd(count: number, unit: OpUnitType) {
      let newDate = dayjs($ActiveLogStore.end || new Date()).add(count, unit)
      // activeLogDayjs = newDate;
      $ActiveLogStore.end = newDate.toDate().getTime()
    },
    clearDate() {
      // await tick(200);
      state.date = null
      $ActiveLogStore.start = null
      $ActiveLogStore.end = null
      // state.showCustomDate = false;
    },
    clearLocation() {
      $ActiveLogStore.lat = null
      $ActiveLogStore.lng = null
      $ActiveLogStore.location = null
    },
    // toggleCustomDate() {
    //   if (state.date) {
    //     // They clicked it - solets clear it
    //     state.date = null;
    //   } else {
    //     state.showCustomDate = true;
    //   }
    // },
    async toggleCustomLocation() {
      if ($ActiveLogStore.lat) {
        $ActiveLogStore.lat = null
        $ActiveLogStore.lng = null
      } else {
        let location: any = await Interact.pickLocation()
        if (location) {
          $ActiveLogStore.lat = location.lat
          $ActiveLogStore.lng = location.lng
          $ActiveLogStore.location = location.name
        }
      }
    },
    input(evt) {
      clearTimeout(debounce)
      debounce = setTimeout(() => {
        const parsed = extract.parse($ActiveLogStore.note)
        methods.highlightElements(parsed || [])
      }, 400)
      methods.checkTextareaSize()
    },
    highlightElements(items: Array<TrackableElement>) {
      const buttons = document.getElementsByClassName('tracker-board-button')
      const tagsInNote = items
        .filter((i) => i.type === 'tracker')
        .map((i) => i.id)
      for (let i = 0; i < buttons.length; i++) {
        try {
          let buttonTag = buttons[i].id.split('-')[1]
          if (tagsInNote.indexOf(buttonTag) !== -1) {
            buttons[i].classList.add('in-note')
          } else if (buttons[i].classList.contains('in-note')) {
            buttons[i].classList.remove('in-note')
          }
        } catch (e) {
          console.error(e.message)
        }
      }
    },
    async checkTextareaSize() {
      const textareaEle = document.getElementById('textarea-capture-note')
      clearTimeout(textareaTimeout)
      textareaTimeout = setTimeout(() => {
        if (textareaEle) {
          // textareaEle.style.height = "42px";
          let height = (textareaEle || {}).scrollHeight || 42
          if (textareaEle && $ActiveLogStore.note.length > 0) {
            textareaEle.style.height = (height > 300 ? 300 : height) + 'px'
          } else {
            textareaEle.style.height = '36px'
          }
          // Cal
          // methods.calculateScore();
        }
      }, 10)
    },
    /**
     * Check for Auto Complete
     */
    autoCompleteSearch(searchTag, type = 'tracker') {
      // Search for Trackers
      try {
        if (type == 'tracker') {
          let tkrs = Object.keys($TrackerStore.trackers || {})
            .map((tag) => {
              return $TrackerStore.trackers[tag]
            })
            .filter((trk) => {
              return trk.tag.search(searchTag.replace('#', '')) > -1
            })
          return tkrs.length ? tkrs : null

          // Search for People
        } else if (type === 'person') {
          try {
            let people = Object.keys($PeopleStore.people || []).filter(
              (person) =>
                person.toLowerCase().search(searchTag.replace('@', '')) > -1,
            )
            return people.length
              ? people.map((username) => {
                  return { tag: username, emoji: '👤', type: 'person' }
                })
              : null
          } catch (e) {
            console.error(`Error Caught ${e.message}`)
          }

          return null

          // Search for Context
        } else if (type === 'context') {
          console.error(
            '### LOOK INTO THIS!!!! todo:// context here is not right',
          )
          return []
          // let context = $ContextStore.filter((term) => {
          //   let text = searchTag.replace("+", "").toLowerCase();
          //   term = term.toLowerCase();
          //   return term.search(text.toLowerCase()) > -1;
          // });
          // return context.length
          //   ? context.map((c) => {
          //       return { tag: c, emoji: "💡", type: "context" };
          //     })
          //   : null;
        }
      } catch (e) {}
    },
    calculateScore() {
      $ActiveLogStore.score =
        $ActiveLogStore.score ||
        ScoreNote($ActiveLogStore.note, new Date().getTime())
    },
    async logSave() {
      saving = true

      methods.calculateScore()

      try {
        await LedgerStore.saveLog($ActiveLogStore)
        saving = false
      } catch (e) {
        console.error(`Error in capture-log logSave ${e.message}`)
        saving = false
      }
      methods.clear()
    },
    async autocompleteText(text) {
      ActiveLogStore.update((s) => {
        s.note = s.note.replace(state.partialTag, text + ' ')
        return s
      })
      await tick(1)
      document.getElementById('textarea-capture-note').focus()
      methods.autoCompleteDone()
    },
    async autoCompleteDone() {
      setTimeout(() => {
        state.partialTag = null
        state.cursorIndex = null
        state.autocompleteResults = null
      }, 10)
    },
    /**
     * On Key Press
     * Process each of the events
     * - look for modifier+enter to save
     * - look for +,#,@ to give auto complete
     */
    keyPress(event) {
      // If enter + shift
      if (event.key === 'Enter' && event.getModifierState('Shift')) {
        event.preventDefault()
        // If enter + modify er
      } else if (
        event.key === 'Enter' &&
        (event.getModifierState('Control') || event.getModifierState('Meta'))
      ) {
        methods.logSave()
        // All other keyboard events
      } else {
        let value = event.target.value
        let last = value.charAt(value.length - 1)
        // If space clear auto complete
        if (last == ' ') {
          methods.autoCompleteDone()
        } else if (value.length) {
          let arr = value.split(' ')
          let tag = arr[arr.length - 1]
          state.cursorIndex = arr.length - 1
          // If its a tag
          if (tag.charAt(0) === '#' && tag.length > 1) {
            state.partialTag = tag
            state.autocompleteResults = methods.autoCompleteSearch(
              tag,
              'tracker',
            )
            // If its a person
          } else if (tag.charAt(0) === '@' && tag.length > 1) {
            state.partialTag = tag
            state.autocompleteResults = methods.autoCompleteSearch(
              tag,
              'person',
            )
            // If it's context
          } else if (tag.charAt(0) === '+' && tag.length > 1) {
            state.partialTag = tag
            state.autocompleteResults = methods.autoCompleteSearch(
              tag,
              'context',
            )
          } else {
            state.partialTag = null
            state.autocompleteResults = null
          }
        } else {
          state.partialTag = null
          state.autocompleteResults = null
        }
      }
    },
    clear() {
      ActiveLogStore.clear()
      methods.autoCompleteDone()
      setTimeout(() => {
        state.date = null
        state.autocompleteResults = null
        state.advanced = false
        state.cursorIndex = null
        state.dateStarter = dayjs().format('YYYY-MM-DDTHH:mm')
        if (textarea) {
          textarea.style.height = '40px'
        }
      }, 120)
    },
  }

  // Clear the settings when saved
  LedgerStore.hook('onLogSaved', (res) => {
    // methods.clear();
    setTimeout(() => {
      state.advanced = false
      methods.autoCompleteDone()
      methods.input({})
    }, 10)
  })

  ActiveLogStore.hook('onAddElement', (element) => {
    methods.input({})
  })

  // When a tag is added by a button or other service
  ActiveLogStore.hook('onAddTag', (res) => {
    // add space to the end.
    setTimeout(() => {
      if (textarea) {
        textarea.value = textarea.value
      }
      // adjust textarea size
      methods.checkTextareaSize()
    }, 10)
  })
</script>

<div
  class="capture-wrapper"
  on:swipeup={methods.swipeUp}
  on:swipedown={methods.swipeDown}>

  <!-- 
    AUTO COMPLETE RESULTS
  -->
  <Container>
    <div class="capture-log">
      <div
        class="save-progress {saved ? 'saved' : ''}
        {saving ? 'saving' : ''}
        {$LedgerStore.saving ? 'saving' : ''}" />
      <div class="p-0">

        <!-- Auto Complet e-->
        <AutoComplete
          input={$ActiveLogStore.note}
          scroller
          on:select={(evt) => {
            ActiveLogStore.updateNote(evt.detail.note)
            textarea.focus()
            textarea.setSelectionRange(textarea.value.length, textarea.value.length)
            tick(100).then(() => {
              methods.checkTextareaSize()
            })
          }} />
        <!-- Note Input -->
        <div
          class="mask-textarea {isFocused ? 'focused' : 'blurred'}
          {$ActiveLogStore.lat || $ActiveLogStore.note.trim().length > 0 ? 'populated' : 'empty'}"
          on:click={() => {
            isFocused = true
          }}>
          <div class="top-section">
            <textarea
              aria-label="Note entry field"
              id="textarea-capture-note"
              style="overflow:hidden"
              disabled={saving || saved}
              bind:value={$ActiveLogStore.note}
              bind:this={textarea}
              on:input={methods.input}
              placeholder={Lang.t('general.whats-up', "What's up?")}
              on:keydown={methods.keyPress}
              on:focus={() => {
                isFocused = true
              }}
              on:blur={() => {
                isFocused = false
              }}
              on:paste={methods.keyPress} />
          </div>
          <div
            class="flex px-2 py-1 border-t border-gray-500 border-opacity-25 bottom-section">
            <Button
              ariaLabel="Location and Date settings"
              size="sm"
              shape="circle"
              color={state.advanced ? 'primary' : 'light'}
              className="ml-1 more-button action-button"
              on:click={toggleAdvanced}>
              {#if state.advanced}
                <NIcon name="more" className="fill-white" />
              {:else}
                <NIcon name="more" className="fill-grey-5" />
              {/if}
            </Button>

            {#if $UserStore.meta.hiddenFeatures}
              <Button
                className="expand-button action-button"
                ariaLabel="Journal Mode"
                icon
                size="sm"
                on:click={Interact.toggleFocusedEditor}>
                <Icon name="expand" className="fill-inverse-2" />
              </Button>
            {/if}

            <Button
              type="clear"
              shape="circle"
              on:click={() => {
                showPositivitySelector = !showPositivitySelector
              }}>
              {getEmojiFromScore($ActiveLogStore.score, true)}
            </Button>

            <div class="filler" />
            {#if $LedgerStore.saving}
              <Button
                className="save-button action-button mr-2"
                shape="circle"
                color="success"
                size="sm">
                <NSpinner size={20} />
              </Button>
            {:else}
              <Button
                ariaLabel="Save Note"
                color="success"
                size="sm"
                on:click={methods.logSave}>

                <NIcon
                  name="airplane"
                  className="mr-1"
                  style="fill: #FFF;"
                  size={20} />
                Save
              </Button>
            {/if}
          </div>
        </div>
      </div>
    </div>
    {#if state.advanced}
      <div class="advanced">
        <div class="">
          <NItem
            truncate
            clickable
            className="mr-2 solo text-sm"
            on:click={methods.toggleCustomLocation}>
            <div slot="left" class="text-sm text-bold">
              <NIcon name="pin" className="mr-2 fill-inverse-2" size={16} />
            </div>
            {#if !$ActiveLogStore.lat}
              <Text>{Lang.t('general.location', 'Location')}</Text>
            {:else}
              <Text>
                {$ActiveLogStore.location || `${math.round($ActiveLogStore.lat, 100)},${math.round($ActiveLogStore.lng, 100)}`}
              </Text>
            {/if}
            <div slot="right" class="flex">
              {#if $ActiveLogStore.lat}
                <Button icon size="sm">
                  <Icon
                    name="close"
                    className="fill-inverse"
                    on:click={methods.clearLocation} />
                </Button>
              {:else if $UserStore.alwaysLocate}
                <Text faded className="pr-1">Current</Text>
              {:else}
                <Text faded className="pr-1">None</Text>
              {/if}
            </div>
          </NItem>
          <!-- Date / Time -->

          <NItem solo className="p-0 pr-1" style="overflow:hidden">
            <DatePicker bind:time={$ActiveLogStore.end} />
            <div slot="left" class="pl-2">
              <Button
                ariaLabel="Previous Day"
                size="xs"
                color="transparent"
                className="px-1 previous-day-action"
                delay={0}
                on:click={() => {
                  methods.dateAdd(-1, 'day')
                }}>
                <Icon name="chevronLeft" size={14} />
              </Button>
              <Button
                ariaLabel="Next Day"
                size="xs"
                color="transparent"
                className="px-1 next-day-action"
                delay={0}
                on:click={() => {
                  methods.dateAdd(1, 'day')
                }}>
                <Icon name="chevronRight" size={14} />
              </Button>
            </div>
            <div slot="right">
              {#if $ActiveLogStore.end}
                <Button
                  className="mr-2"
                  icon
                  on:click={methods.clearDate}
                  ariaLabel="Close Advanced">
                  <NIcon name="close" className="fill-inverse" size={22} />
                </Button>
              {/if}
            </div>

          </NItem>

        </div>
      </div>
    {/if}

  </Container>
</div>

<Backdrop id="positivty-selector" visible={showPositivitySelector}>
  <PositivitySelector
    id="score"
    showClose={true}
    on:close={() => {
      showPositivitySelector = false
    }}
    bind:score={$ActiveLogStore.score}
    on:change={(evt) => {
      $ActiveLogStore.score = evt.detail
      showPositivitySelector = false
    }} />
</Backdrop>
