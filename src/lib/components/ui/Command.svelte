<script>
  import { setContext } from "svelte";

  let { children } = $props();
  let dialogElement = $state(null);
  let registeredItems = [];
  let selectedIndex = $state(0);

  function updateHighlight() {
    registeredItems.forEach((item, i) => {
      if (i === selectedIndex) {
        item.element?.setAttribute("data-selected", "true");
        item.element?.scrollIntoView({ block: "nearest" });
      } else {
        item.element?.removeAttribute("data-selected");
      }
    });
  }

  setContext("Command", {
    get dialogElement() {
      return dialogElement;
    },
    set dialogElement(el) {
      dialogElement = el;
    },
    open() {
      selectedIndex = 0;
      dialogElement?.showModal();
      setTimeout(updateHighlight, 0);
    },
    close() {
      dialogElement?.close();
    },

    get selectedIndex() {
      return selectedIndex;
    },

    resetItems() {
      registeredItems = [];
    },

    registerItem(item) {
      registeredItems.push(item);
      return () => {
        registeredItems = registeredItems.filter((i) => i !== item);
      };
    },

    updateSelection(index) {
      if (registeredItems.length === 0) return;
      if (index < 0) index = registeredItems.length - 1;
      if (index >= registeredItems.length) index = 0;
      selectedIndex = index;
      updateHighlight();
    },

    triggerActive(e) {
      const active = registeredItems[selectedIndex];
      active?.onSelect(e);
    },

    getItemIndex(item) {
      return registeredItems.indexOf(item);
    },
  });
</script>

{@render children?.()}
