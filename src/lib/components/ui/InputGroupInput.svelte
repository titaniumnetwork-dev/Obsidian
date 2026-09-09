<script>
  import { twMerge } from "tailwind-merge";

  let { class: className, value = $bindable(""), ...restProps } = $props();
</script>

<input
  bind:value
  class={twMerge(
    "w-full h-full px-2.5 not-first:pl-1.5 not-last:pr-1.5 outline-none text-sm placeholder:text-muted",
    className,
  )}
  {...restProps}
/>
