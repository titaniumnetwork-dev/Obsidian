<script>
  import { twMerge } from "tailwind-merge";

  let { className, heading, children, ...restProps } = $props();
</script>

<div class={twMerge("", className)} {...restProps}>
  {#if heading}
    <div class="text-muted text-xs px-2 py-1.5">
      {heading}
    </div>
  {/if}
  <div class="">
    {@render children?.()}
  </div>
</div>