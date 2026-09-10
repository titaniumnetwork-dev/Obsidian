<script>
  import { twMerge } from "tailwind-merge";

  let { class: className, children, ...restProps } = $props();
</script>

<div
  class={twMerge("flex items-center first:pl-2 last:pr-2", className)}
  {...restProps}
>
  {@render children?.()}
</div>
