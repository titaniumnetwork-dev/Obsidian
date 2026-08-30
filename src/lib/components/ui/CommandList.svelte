<script>
  import { getContext } from "svelte";
  import { twMerge } from "tailwind-merge";

  let { class: className, children, ...restProps } = $props();
  const ctx = getContext("Command");

  ctx.resetItems?.();
</script>

<div class={twMerge("", className)} {...restProps}>
  {@render children?.()}
</div>
