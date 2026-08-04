<script>
  import { getContext } from "svelte";

  let { children, ...restProps } = $props();

  const ctx = getContext("AlertDialog");
</script>

<div style="display: contents" onclick={() => ctx.close()} {...restProps}>
  {@render children?.()}
</div>
