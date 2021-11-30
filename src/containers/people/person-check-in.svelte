<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  // Modules
  import NomieLog from '../../modules/nomie-log/nomie-log'

  // Components
  import Spinner from '../../components/spinner/spinner.svelte'
  import NInput from '../../components/input/input.svelte'
  import NItem from '../../components/list-item/list-item.svelte'
  import AutoComplete from '../../components/auto-complete/auto-complete.svelte'
  import NIcon from '../../components/icon/icon.svelte'
  import NButtonGroup from '../../components/button-group/button-group.svelte'
  import NPositivitySelector from '../../components/positivity-selector/positivity-selector.svelte'

  // utils
  import tick from '../../utils/tick/tick'

  // Stores
  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'
  import { LedgerStore } from '../ledger/LedgerStore'
  import Button from '../../components/button/button.svelte'
  import Row from '../../components/row/row.svelte'
  import DatePicker from '../../components/date-picker/date-picker.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import Spacer from '../../components/spacer/spacer.svelte'

  const state = {
    note: `@${$Interact.people.active} `,
    checkingIn: false,
    checkedIn: false,
    score: 0,
    date: undefined,
  }
  const getPlaceholder = () => {
    return `What are you and @${$Interact.people.active} up to?`
  }
  let checkIn = async () => {
    state.checkingIn = true
    try {
      let log = new NomieLog({
        note: state.note,
      })
      // Set Score
      log.score = state.score
      // Set Date if set
      if (state.date) {
        log.end = state.date
      }
      // Save to Ledger
      let saved = await LedgerStore.saveLog(log)
      // Change UI Status
      state.checkingIn = false
      state.checkedIn = true
      // Wait for 600 ms
      await tick(600)
      // Announce change
      dispatch('checkedIn', saved)
    } catch (e) {
      Interact.alert('Error', e.message)
      state.checkingIn = false
    }
  }
</script>

<div class="p-3 person-checkin">
  <div class="text-area-holder">

    <NInput
      type="textarea"
      rows={6}
      placeholder={getPlaceholder()}
      bind:value={state.note} />
    <AutoComplete
      scroller
      input={state.note}
      on:select={(evt) => {
        let payload = evt.detail
        state.note = payload.note
      }} />

    <ListItem solo className="mx-0 w-100 py-1">
      <DatePicker bind:time={state.date} />
    </ListItem>
  </div>

  <Spacer className="mt-3" />

  <NPositivitySelector
    transparent
    score={state.score}
    size="lg"
    on:change={(evt) => {
      state.score = evt.detail
    }} />

  <Spacer className="mt-3" />

  {#if !state.checkingIn && !state.checkedIn}
    <Button className="bg-primary-500 text-white" block on:click={checkIn}>
      Check-In
    </Button>
  {:else if state.checkingIn}
    <Button className="bg-primary-500 text-white" block color="light" disabled>
      <Spinner size={24} />
      <div class="ml-2">Checking In...</div>
    </Button>
  {/if}

</div>
