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

<style lang="scss" type="text/scss">
  @import "../../scss/utils/_utils";
  $height: 30px;
  .onoffswitch {
    position: relative;
    width: 50px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;

    .onoffswitch-checkbox {
      display: none;
    }

    .onoffswitch-label {
      display: block;
      overflow: hidden;
      cursor: pointer;
      height: $height;
      padding: 0;
      line-height: $height;
      border: 2px solid var(--color-grey-6);
      border-radius: $height;
      background-color: var(--color-solid-1);
      transition: background-color 0.2s ease-in-out;
      margin: 0;
    }

    .onoffswitch-label:before {
      content: "";
      display: block;
      width: $height;
      margin: 0px;
      background: var(--color-solid);
      position: absolute;
      top: 0;
      bottom: 0;
      right: 22px;
      border: 2px solid var(--color-grey-6);
      border-radius: $height;
      transition: all 0.2s ease-in-out 0s;
    }

    .onoffswitch-checkbox:checked + .onoffswitch-label {
      background-color: var(--color-primary-bright);
    }

    .onoffswitch-checkbox:checked + .onoffswitch-label,
    .onoffswitch-checkbox:checked + .onoffswitch-label:before {
      border-color: var(--color-primary-bright);
    }
    .onoffswitch-checkbox:checked + .onoffswitch-label:before {
      right: 0px;
    }
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
  <label class="onoffswitch-label" for={id} />
</div>
