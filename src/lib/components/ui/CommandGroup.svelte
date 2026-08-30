<script>
  let { class: className, heading, children, ...restProps } = $props();
</script>

<div class={className} {...restProps}>
  {#if heading}
    <div class="text-muted text-xs px-2 py-1.5">
      {heading}
    </div>
  {/if}
  <div>
    {@render children?.()}
  </div>
</div>
