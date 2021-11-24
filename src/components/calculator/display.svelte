<script>
  import LetterTicker from './../letter-ticker/letter-ticker.svelte'
  export let total
  import Ripple from '../ripple/ripple.svelte'
  export let totalArr
  export let buttons
</script>

<style global lang="postcss">
  .calculator_bound {
    @apply px-3;
    @apply h-full;

    @apply flex;
    @apply items-center;
    @apply justify-center;
  }
  .calculator {
    @apply flex-grow;
    @apply h-full;
    @apply w-full;
    @apply grid;
    grid-template-columns: 22% 22% 22% 22%;
    grid-template-rows: 16% 14% 14% 14% 14% 14%;
    grid-gap: 9px;
    background-color: transparent;
    @apply cursor-pointer;
    @apply select-none;
    @apply mx-auto;
  }

  #calculator__display {
    grid-column: 1 / span 4;
    @apply flex flex-col;
    @apply justify-center;
    @apply text-black dark:text-white;
    @apply font-mono;
    @apply bg-white dark:bg-black;
    cursor: initial;
    @apply h-full;
    @apply p-2;
    @apply pb-3;
    @apply rounded-lg;
  }

  #calculator__display > div {
    /* text-align: right;
    box-sizing: border-box;
    height: 50%;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
    white-space: nowrap; */
    @apply text-right;
  }

  #calculator__display .top {
    @apply text-xs;
    color: var(--color-solid-600);
  }
  #calculator__display .bottom {
    @apply text-3xl;
    color: var(--color-solid-900);
    @apply leading-5;
    @apply mt-2;
    @apply font-sans;
    @apply font-bold;
  }

  #calculator button {
    background-color: var(--color-solid);
    @apply bg-white dark:bg-black;
    @apply text-black dark:text-white;
    @apply shadow-md;
    cursor: pointer;
    @apply rounded-full;
    @apply flex;
    @apply items-center;
    @apply justify-center;
    @apply text-xl;
    @apply uppercase;
  }
  #calculator__display button::after {
    content: '';
    padding-bottom: 50%;
  }

  #calculator #ac,
  #calculator #clear,
  #calculator #neg {
    @apply bg-gray-400;
    @apply text-white;
  }

  #calculator #minus,
  #calculator #multiply,
  #calculator #add,
  #calculator #divide {
    @apply bg-yellow-600;
    @apply text-white;
  }

  #calculator #zero {
    grid-column: 1 / span 2;
    @apply justify-start;
    @apply pl-4;
  }
</style>

<div class="calculator_bound">
  <div id="calculator" class="calculator">
    <div id="calculator__display">
      {#if total !== 'err'}
        <div class="top">{totalArr.join(' ')}</div>
        <div class="bottom">
          <LetterTicker text={`${total}`} className="text-right" />
        </div>
      {:else}
        <div class="mt-4">
          <LetterTicker text={`ERR`} className="text-right" />
        </div>
      {/if}
    </div>
    {#each buttons as button}
      <Ripple
        id={button.id}
        on:click={() => {
          button.func(button.value)
        }}>
        {button.value}
      </Ripple>
    {/each}
  </div>
</div>
