<script>
  import { onMount } from "svelte";
  import Icon from "../icon/icon.svelte";
  export let started = undefined;
  export let lg = undefined;
  export let className = "";
  export let color = "var(--color-red)";
  export let filled = false;

  onMount(() => {
    if (started) {
      methods.init();
    }
  });

  $: value = "00:00:00";

  const methods = {
    init() {
      setInterval(() => {
        let ms = new Date().getTime() - started;
        value = methods.secondsToTime(methods.msToSecond(ms));
      }, 1000);
      let ms = new Date().getTime() - started;
      value = methods.secondsToTime(methods.msToSecond(ms));
    },
    normalizeTime(time) {
      return (time + "").length === 1 ? time.padStart(2, "0") : time;
    },
    secondsToTime(secondsVar) {
      let seconds = secondsVar.toFixed(0);
      let minutes = Math.floor(parseInt(seconds) / 60).toString();
      let hours = "";

      if (parseInt(minutes) > 59) {
        hours = this.normalizeTime(Math.floor(parseInt(minutes) / 60).toString());
        minutes = this.normalizeTime((parseInt(minutes) - parseInt(hours) * 60).toString());
      }
      seconds = this.normalizeTime(Math.floor(parseInt(seconds) % 60).toString());

      minutes = this.normalizeTime(minutes);

      if (hours !== "") {
        hours = parseInt(hours);
        // if (hours > 24) {
        //   let days = Math.floor(hours / 24);
        //   hours = hours - days * 24;
        //   return `${days}d ${hours}h ${minutes}m ${seconds}s`;
        // }
        return `${hours}:${minutes}:${seconds}`;
      }
      return `00:${minutes}:${seconds}`;
    },

    msToSecond(ms) {
      return ms / 1000;
    },
  };
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  .n-counter {
    font-size: 0.7em;
    font-weight: bold;
    display: flex;
    align-items: center;

    &.large {
      display: flex;
      padding: 12px;
      font-size: 40px;
      flex-grow: 1;
      text-align: center;
      justify-content: center;
      align-content: center;
      min-height: 50px;
      height: 50px;
      color: var(--color-inverse-2);
    }
    &.filled {
      border-radius: 4px;
      padding: 1px 6px;
    }
  }
</style>

<div
  class="n-counter {className}
  {lg ? 'large' : 'small'}
  {filled ? 'filled' : ''}"
  style={`color:${filled ? '#FFF' : color}; background-color:${filled ? color : 'transparent'}`}>
  {#if !lg}
    <Icon name="time" size="12" className="mr-1" />
  {/if}
  {value}
</div>
