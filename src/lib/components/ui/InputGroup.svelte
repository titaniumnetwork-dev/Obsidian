<script>
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let {
    class: className,
    size,
    width,
    disabled,
    children,
    ...restProps
  } = $props();

  const inputGroup = tv({
    base: "bg-input/30 text-sm transition-colors disabled:opacity-50 border border-input outline-none rounded-lg w-full placeholder:text-muted flex items-center",
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

<div
  class={twMerge(inputGroup({ size, width }), className)}
  {disabled}
  {...restProps}
>
  {@render children?.()}
</div>
