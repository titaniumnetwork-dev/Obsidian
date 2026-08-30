<script>
  import { getContext } from "svelte";

  let { className, children, ...restProps } = $props();
  const ctx = getContext("Command");

  ctx.resetItems?.();
</script>

<div class={className} {...restProps}>
  {@render children?.()}
</div>
