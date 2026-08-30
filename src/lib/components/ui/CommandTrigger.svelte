<script>
  import { getContext } from "svelte";

  let { children, ...restProps } = $props();

  const ctx = getContext("Command");
</script>

<div class="contents" onclick={() => ctx.open()} {...restProps}>
  {@render children?.()}
</div>
