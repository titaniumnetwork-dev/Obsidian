<script module>
  const activeMenus = new Set();
</script>

<script>
  import { tick } from "svelte";

  let { children } = $props();

  let show = $state(false);
  let x = $state(0);
  let y = $state(0);
  let menuEl = $state(null);

  let activeTrigger = $state(null);

  function preventScroll(e) {
    e.preventDefault();
  }

  function preventKeyScroll(e) {
    const scrollKeys = [" ", "PageUp", "PageDown", "Home", "End"];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  }

  function lockScroll() {
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventKeyScroll, { passive: false });
  }

  function unlockScroll() {
    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    window.removeEventListener("keydown", preventKeyScroll);
  }

  export async function open(e) {
    e.preventDefault();
    e.stopPropagation();

    activeMenus.forEach((closeFn) => closeFn());
    activeMenus.add(close);

    if (activeTrigger) activeTrigger.removeAttribute("data-context-menu");

    activeTrigger = e.currentTarget;
    if (activeTrigger) activeTrigger.setAttribute("data-context-menu", "true");

    show = true;
    lockScroll();

    if (menuEl) {
      const rect = menuEl.getBoundingClientRect();

      x =
        e.clientX + rect.width > window.innerWidth
          ? e.clientX - rect.width
          : e.clientX;
      y =
        e.clientY + rect.height > window.innerHeight
          ? e.clientY - rect.height
          : e.clientY;

      await tick();
      menuEl.focus();
    }
  }

  export function close() {
    if (!show) return;
    show = false;
    unlockScroll();

    activeMenus.delete(close);

    if (activeTrigger) {
      activeTrigger.removeAttribute("data-context-menu");
      activeTrigger = null;
    }
  }

  function handleOutsideInteraction(e) {
    if (show && menuEl && !menuEl.contains(e.target)) {
      close();
    }
  }
</script>

<svelte:window
  onclickcapture={handleOutsideInteraction}
  onclick={handleOutsideInteraction}
  oncontextmenu={handleOutsideInteraction}
  onresize={close}
  onkeydown={(e) => e.key === "Escape" && close()}
/>

<div
  bind:this={menuEl}
  aria-hidden={!show}
  class="fixed z-50 min-w-48 max-h-[calc(100vh-2rem)] overflow-y-auto bg-surface border border-border rounded-xl shadow-xl p-2 flex flex-col gap-2
           {show
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none'}"
  style="top: {y}px; left: {x}px;"
  oncontextmenu={(e) => e.preventDefault()}
>
  {#if children}
    {@render children()}
  {/if}
</div>
