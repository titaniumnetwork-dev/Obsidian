<script>
  import { twMerge } from "tailwind-merge";
  import { tv } from "tailwind-variants";

  let { class: className, ...restProps } = $props();

  const card = tv({
    base: "appearance-none cursor-pointer transition-colors bg-input/80 checked:bg-primary w-8 h-4.5 rounded-full flex items-center before:content-[''] before:h-4 before:w-4 before:rounded-full before:bg-foreground checked:before:bg-card before:block before:translate-x-0.25 checked:before:translate-x-3.75 before:transition-[translate,background,border]",
  });
</script>

<input class={twMerge(card(), className)} {...restProps} type="checkbox" />
