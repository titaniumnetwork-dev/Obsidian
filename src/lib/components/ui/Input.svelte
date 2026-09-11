<script>
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let {
    class: className,
    size,
    width,
    value = $bindable(""),
    disabled,
    ...restProps
  } = $props();

  const input = tv({
    base: "bg-input/30 text-sm transition-colors disabled:opacity-50 border border-input outline-none rounded-lg w-full placeholder:text-muted px-2.5",
    variants: {
      size: {
        default: "h-9",
        sm: "h-8",
      },
      width: {
        default: "w-full",
        fixed: "w-96",
      },
    },
    defaultVariants: {
      size: "default",
      width: "default",
    },
  });
</script>

<input
  bind:value
  class={twMerge(input({ size, width }), className)}
  {disabled}
  {...restProps}
/>
