<script>
  
</script>

<style>
  .time-grid {
	 display: flex;
	 flex-direction: column;
	 position: relative;
	 flex-grow: 1;
	 min-height: 100%;
	 flex-shrink: 1;
}
 .time-grid .hour-header {
	 padding-left: 25px;
	 padding-top: 4px;
	 padding-bottom: 2px;
	 display: flex;
	 flex-direction: row;
}
 .time-grid .hour-header .hour {
	 width: calc(100% / 24);
	 font-size: 0.4em;
	 display: relative;
}
 .time-grid label {
	 margin: 0;
	 font-size: 9px;
	 text-align: right;
	 color: var(--color-inverse);
	 padding-right: 4px;
	 width: 36px;
	 font-weight: bold;
	 text-transform: uppercase;
}
 .time-grid .hour {
	 color: var(--color-inverse);
}
 .time-grid .day {
	 display: flex;
	 flex-direction: row;
	 height: calc(100% / 7);
	 align-items: center;
}
 .time-grid .day .hour {
	 width: calc(100% / 24);
	 text-align: center;
	 margin: 0px;
	 background-color: var(--color-primary);
	 height: 100%;
}
 
</style>

<div class="time-grid {className}" style="height:{height}px; {style}" >

  {#if $UserStore.meta.firstDayOfWeek === '2'}

    {#each days as day, index}
      {#if index !== 0}
        <div class="day">
          <label>{dayjs(new Date()).day(index).format('ddd').substr(0, 2)}</label>
          {#each day as hour, hi}
            <div class="hour hour-{hi}" style="opacity: {days[index][hi] / 100 || 0}; background-color: {color}" />
          {/each}
        </div>
      {/if}
    {/each}

    <div class="day">
      <label>{dayjs(new Date()).day(0).format('ddd').substr(0, 2)}</label>
      {#each days[0] as hour, hi}
        <div class="hour hour-{hi}" style="opacity: {days[0][hi] / 100 || 0}; background-color: {color}" />
      {/each}
    </div>
    
  {:else}
    
    {#each days as day, index}
      <div class="day">
        <label>{dayjs(new Date()).day(index).format('ddd').substr(0, 2)}</label>
        {#each day as hour, hi}
          <div class="hour hour-{hi}" style="opacity: {days[index][hi] / 100 || 0}; background-color: {color}" />
        {/each}
      </div>
    {/each}
  {/if}

  <div class="hour-header">
    {#each hours as hour, index}
      <div class="hour hour-{index} header">{hour}</div>
    {/each}
  </div>
</div>
