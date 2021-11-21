<script>
  //utils
  import { createEventDispatcher } from "svelte";

  // consts
  const dispatch = createEventDispatcher();

  export let value = false;
  export let locked = null;

  const id = `switch-${Math.random()}`;

  const methods = {
    onChange(event) {
      if (locked == null) {
        dispatch("change", event.target.checked);
      } else {
        event.target.checked = locked;
      }
    },
  };
</script>

<style lang="postcss">
  .onoffswitch {
	 position: relative;
	 width: 50px;
	 -webkit-user-select: none;
	 -moz-user-select: none;
	 -ms-user-select: none;
}
 .onoffswitch .onoffswitch-checkbox {
	 display: none;
}
 .onoffswitch .onoffswitch-label {
	 display: block;
	 overflow: hidden;
	 cursor: pointer;
	 height: 30px;
	 padding: 0;
	 line-height: 30px;
	 /* border: 2px solid var(--color-grey-6); */
	 @apply border-2 border-gray-100 dark:border-gray-500;
	 border-radius: 30px;
	 @apply bg-gray-300 dark:bg-gray-600;
	 transition: background-color 0.2s ease-in-out;
	 margin: 0;
}
 .onoffswitch .onoffswitch-label:before {
	 content: "";
	 display: block;
	 width: 30px;
	 margin: 0px;
	 @apply bg-white dark:bg-gray-900;
	 @apply border-2 border-gray-300 dark:border-gray-500;
	 position: absolute;
	 top: 0;
	 bottom: 0;
	 right: 22px;
	 
	 border-radius: 30px;
	 transition: all 0.2s ease-in-out 0s;
}
 .onoffswitch .onoffswitch-checkbox:checked + .onoffswitch-label {
	 background-color: var(--color-primary-bright);
}
 .onoffswitch .onoffswitch-checkbox:checked + .onoffswitch-label, .onoffswitch .onoffswitch-checkbox:checked + .onoffswitch-label:before {
	 border-color: var(--color-primary-bright);
}
 .onoffswitch .onoffswitch-checkbox:checked + .onoffswitch-label:before {
	 right: 0px;
}
 
</style>

<div class="onoffswitch">
  <input
    type="checkbox"
    name="onoffswitch"
    class="onoffswitch-checkbox"
    {id}
    bind:value
    bind:checked={value}
    on:change={methods.onChange} />
  <label class="onoffswitch-label" for={id} aria-label="Switch is {value ? 'On' : 'Off'}" aria-controls="input" />
</div>
