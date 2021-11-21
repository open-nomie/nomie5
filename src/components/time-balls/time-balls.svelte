<script>
  export let hours = [];
  export let color = undefined;
  export let base = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
</script>

<style lang="postcss">
  .time-balls {
	 border-radius: 4px;
	 height: 4px;
	 display: flex;
}
 .time-balls .hour {
	 flex-shrink: 0;
	 flex-grow: 0;
	 min-height: calc(100% / 24);
	 min-width: calc(100% / 24);
	 border-radius: 2px;
	 overflow: visible;
}
 .time-balls .hour .active {
	 background-color: var(--color-primary);
	 opacity: 0.5;
	 width: 4px;
	 height: 4px;
	 border-radius: 2px;
}
 
</style>

<div class="time-balls">
  {#each base as hour}
    <div class="hour">
      {#if hours.indexOf(hour) > -1}
        <div class="active" style={color ? `background-color:${color}` : ''} />
      {/if}
    </div>
  {/each}
</div>
