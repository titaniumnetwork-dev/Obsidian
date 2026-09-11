<script>
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let {
    class: className,
    width,
    disabled,
    value = $bindable(""),
    ...restProps
  } = $props();

  const textarea = tv({
    base: "bg-input/30 text-sm transition-colors disabled:opacity-50 border border-input outline-none rounded-lg w-full placeholder:text-muted py-2 px-2.5 shrink-0 min-h-16 field-sizing-content resize-none",
    variants: {
      width: {
        default: "w-full",
        fixed: "w-96",
      },
    },
    defaultVariants: {
      width: "default",
    },
  });
</script>

<textarea
  bind:value
  spellcheck="false"
  class={twMerge(textarea({ width }), className)}
  {disabled}
  {...restProps}></textarea>
