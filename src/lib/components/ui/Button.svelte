<script>
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let {
    class: className,
    variant,
    size,
    href = undefined,
    disabled,
    children,
    ...restProps
  } = $props();

  const button = tv({
    base: "rounded-lg flex gap-1.5 items-center cursor-pointer text-sm transition-colors",
    variants: {
      variant: {
        default: "bg-primary text-text-inverse",
        outline: "bg-neutral-900 border border-input",
        secondary: "bg-neutral-800",
        ghost: "hover:bg-neutral-800",
      },
      size: {
        default: "h-9 px-2.5",
        sm: "h-8 px-2.5",
        icon: "size-9 justify-center",
        "icon-sm": "size-8 justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  });
</script>

{#if href}
  <a
    class={twMerge(button({ variant, size }), className)}
    href={disabled ? undefined : href}
    {disabled}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    class={twMerge(button({ variant, size }), className)}
    {disabled}
    {...restProps}>{@render children?.()}</button
  >
{/if}
