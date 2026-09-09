<script>
  import { Search } from "@lucide/svelte";
  import { getContext, tick } from "svelte";
  import InputGroup from "./InputGroup.svelte";
  import InputGroupAddon from "./InputGroupAddon.svelte";
  import InputGroupInput from "./InputGroupInput.svelte";

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

<InputGroup size="sm" class={className}>
  <InputGroupAddon>
    <Search class="text-muted" size="16" />
  </InputGroupAddon>
  <InputGroupInput
    bind:value
    onkeydown={handleKeydown}
    class="w-full h-full bg-transparent outline-none placeholder:text-muted text-sm"
    {placeholder}
    {...restProps}
  />
</InputGroup>
