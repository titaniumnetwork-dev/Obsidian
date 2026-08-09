<script>
  import { getContext } from "svelte";
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let { class: className, size, children, onclose, ...restProps } = $props();

  const ctx = getContext("AlertDialog");

  const content = tv({
    base: "m-auto max-w-xs bg-card p-4 open:flex rounded-radius border border-input outline-none text-foreground flex-col gap-4 transition-all duration-200 transition-discrete opacity-0 scale-95 open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-95 backdrop:transition-all backdrop:duration-200 backdrop:transition-discrete backdrop:bg-transparent backdrop:backdrop-blur-none open:backdrop:bg-black/10 open:backdrop:backdrop-blur-xs starting:open:backdrop:bg-transparent starting:open:backdrop:backdrop-blur-none pointer-events-auto",
  });
</script>

<dialog
  bind:this={ctx.dialogElement}
  class={twMerge(content({ size }), className)}
  {onclose}
  {...restProps}
>
  {@render children?.()}
</dialog>
