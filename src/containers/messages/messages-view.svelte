<script lang="ts">
  import Dot from './../../components/dot/dot.svelte'
  import Empty from './../empty/empty.svelte'
  import { MessageStore } from './MessageStore'
  import Button from '../../components/button/button.svelte'
  import { Lang } from '../../store/lang'
  import Panel from '../../components/panel/panel.svelte'
  import Modal2 from '../../components/modal/modal2.svelte'
  import { UserStore } from '../../store/user-store'
  import { onMount, onDestroy } from 'svelte'

  import dayjs from 'dayjs'
  import snarkdown from 'snarkdown'

  import Layout from '../layout/layout.svelte'

  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import BackButton from '../../components/back-button/back-button.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Container from '../../components/container/container.svelte'

  onMount(() => {
    MessageStore.loadMessages()
  })

  onDestroy(() => {
    MessageStore.rememberSeenDate()
  })
</script>

<style global>
  .prose img {
    @apply rounded-lg;
  }
  .prose a {
    @apply text-primary-500;
  }
</style>

<Layout>
  <header slot="header">
    <ToolbarGrid>
      <div slot="left">
        <BackButton />
      </div>
      <h1 class="ntitle">
        Messages
        {#if $MessageStore.unseen}({$MessageStore.unseen}){/if}
      </h1>
    </ToolbarGrid>
  </header>
  <main class="h-full bg-gray-200 dark:bg-gray-800">
    <Container className="p-4 lg:py-4 ">
      {#if $MessageStore.messages.length === 0}
        <Empty title="No recent messages" emoji="🦙" />
      {/if}
      <List className="rounded-lg">
        {#each $MessageStore.messages as message, index}
          <ListItem
            clickable
            on:click={() => MessageStore.readMessage(message)}
            className={message.unseen ? 'bg-primary-100 dark:bg-primary-900' : ''}>
            <h2
              class="{message.unseen ? 'font-bold ' : 'font-medium'}
              leading-snug">
              {#if message.unseen}
                <Dot size={10} className="bg-primary-500 mr-1" />
              {/if}
              {message.subject}
            </h2>
            <p class="flex-grow flex-shrink text-sm text-gray-500 line-clamp-1">
              {message.body}
            </p>
            <p class="text-xs text-gray-900 dark:text-gray-100">
              {dayjs(message.created).format(UserStore.getDateTimeFormat().date)}
            </p>
          </ListItem>
        {/each}
      </List>
    </Container>
  </main>
</Layout>

<Modal2
  tappable
  on:close={MessageStore.closeModal}
  visible={$MessageStore.activeMessage ? true : false}
  id="message-viewer">
  <Panel className="h-full">

    <header slot="header">
      <ToolbarGrid>
        <div slot="left">
          <Button
            type="clear"
            on:click={MessageStore.closeModal}
            className="text-primary-500">
            {Lang.t('general.done', ' Done')}
          </Button>
        </div>
      </ToolbarGrid>
    </header>
    <main class="flex-grow h-full p-4 pb-20 mb-20 prose flex-shink ">
      <h1 class="pb-2 font-bold dark:text-white">
        {$MessageStore.activeMessage.subject}
      </h1>
      <div class="dark:text-gray-200">
        {@html snarkdown($MessageStore.activeMessage.body)}
      </div>
    </main>
  </Panel>
</Modal2>
