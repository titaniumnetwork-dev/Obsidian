<script>
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let { class: className, size, children, ...restProps } = $props();

  const card = tv({
    base: "flex flex-col rounded-radius border border-border text-sm bg-neutral-900",
    variants: {
      size: {
        default: "p-6 gap-6",
        sm: "p-4 gap-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  });
</script>

<div class={twMerge(card({ size }), className)} {...restProps}>
  {@render children?.()}
</div>
