<script>
  import { getContext, onMount } from "svelte";
  import { twMerge } from "tailwind-merge";

  let { class: className, children, onselect, ...restProps } = $props();
  const ctx = getContext("Command");

  let element = $state(null);

  const itemInstance = {
    get element() {
      return element;
    },
    onSelect: (e) => onselect?.(e, ctx),
  };

  onMount(() => {
    return ctx.registerItem(itemInstance);
  });

  function handlePointerMove() {
    const index = ctx.getItemIndex(itemInstance);
    if (index !== -1) {
      ctx.updateSelection(index);
    }
  }
</script>

<button
  bind:this={element}
  type="button"
  onpointermove={handlePointerMove}
  class={twMerge(
    "w-full rounded-lg transition-colors data-[selected=true]:bg-secondary flex items-center gap-2 text-sm px-2 py-1.5 cursor-pointer truncate",
    className,
  )}
  onclick={(e) => onselect?.(e, ctx)}
  {...restProps}
>
  {@render children?.()}
</button>
