<script>
  import { twMerge } from "tailwind-merge";

  let { class: className, children, ...restProps } = $props();
</script>

<div class={twMerge("text-center py-5 text-sm", className)} {...restProps}>
  {@render children?.()}
</div>
