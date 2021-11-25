<script>
  export let percentage = 0
  export let className = ''
  export let style = ''
  export let color = 'primary-bright'
</script>

<div
  class="progress h-3 bg-gray-300 rounded-full dark:bg-gray-700 {className}"
  {style}>
  <div
    class="h-3 rounded-full {`${percentage}` !== '100' ? 'animate-pulse' : ''}
    progress-bar bg-primary-500"
    role="progressbar"
    style={`width:${percentage}%`} />
</div>
