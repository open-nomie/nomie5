<script lang="ts">
  export let value;
</script>

<style lang="scss">
  .tiny-color-picker {
  }
  button {
    width: 24px;
    height: 24px;
    border: none;
    padding: 0;
    margin: 4px;
    border-radius: 50%;
    opacity: 0.3;
    &.active {
      opacity: 1;
    }
  }
</style>

<div class="tiny-color-picker n-row">
  <button
    on:click={() => {
      value = 'green';
    }}
    class="bg-green {value == 'green' ? 'active' : ''}" />
  <button
    on:click={() => {
      value = 'orange';
    }}
    class="bg-orange {value == 'orange' ? 'active' : ''}" />
  <button
    on:click={() => {
      value = 'red';
    }}
    class="bg-red {value == 'red' ? 'active' : ''}" />
  <button
    on:click={() => {
      value = 'blue';
    }}
    class="bg-blue {value == 'blue' ? 'active' : ''}" />
</div>
