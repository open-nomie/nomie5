<script>
  import { onMount } from "svelte";
  export let started = undefined;
  export let lg = undefined;
  export let className = "";

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
        hours = this.normalizeTime(
          Math.floor(parseInt(minutes) / 60).toString()
        );
        minutes = this.normalizeTime(
          (parseInt(minutes) - parseInt(hours) * 60).toString()
        );
      }
      seconds = this.normalizeTime(
        Math.floor(parseInt(seconds) % 60).toString()
      );

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
    }
  };
</script>

<style lang="scss">
  @import "../../scss/utils/_utils";
  .n-counter {
    background-color: red;
    color: #fff;
    font-size: 0.9rem;
    font-weight: bold;
    height: 20px;
    line-height: 20px;
    padding: 0 4px;
    border-radius: 9px;
    display: flex;
    width: 100%;
    justify-content: center;
    align-content: center;
    &.large {
      font-size: 40px;
      flex-grow: 1;
      text-align: center;
      justify-content: center;
      align-content: center;
      height: auto;
    }
  }
</style>

<div class="n-counter {className} {lg ? 'large' : 'small'}">{value}</div>
