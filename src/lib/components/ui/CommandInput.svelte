<script>
  import { Search } from "@lucide/svelte";
  import { getContext, tick } from "svelte";
  import { twMerge } from "tailwind-merge";

  let {
    class: className,
    value = $bindable(""),
    placeholder,
    ...restProps
  } = $props();
  const ctx = getContext("Command");

  function handleKeydown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      ctx.updateSelection((ctx.selectedIndex ?? 0) + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      ctx.updateSelection((ctx.selectedIndex ?? 0) - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      ctx.triggerActive(e);
    }
  }

  $effect(() => {
    value;
    tick().then(() => ctx.updateSelection(0));
  });
</script>

<div
  class={twMerge(
    "bg-input/30 rounded-lg items-center flex border border-input h-8 px-2.5 gap-1.5 shrink-0",
    className,
  )}
>
  <Search class="text-muted" size="16" />
  <input
    bind:value
    onkeydown={handleKeydown}
    class="w-full h-full bg-transparent outline-none placeholder:text-muted text-sm"
    {placeholder}
    {...restProps}
  />
</div>
