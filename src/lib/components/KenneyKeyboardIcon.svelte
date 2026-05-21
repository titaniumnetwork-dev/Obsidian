<script>
  import { onMount } from "svelte";

  let { key = "Escape", size = "w-6 h-6" } = $props();
  let isMac = $state(false);

  onMount(() => {
    isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  });

  let imagePath = $derived.by(() => {
    const maps = {
      " ": "space",
      Space: "space",
      ArrowUp: "arrow_up",
      ArrowDown: "arrow_down",
      ArrowLeft: "arrow_left",
      ArrowRight: "arrow_right",
      Enter: "enter",
      Escape: "escape",
      ControlLeft: "ctrl",
      ControlRight: "ctrl",
      AltLeft: "alt",
      AltRight: "alt",
      MetaLeft: "win",
      MetaRight: "win",
      ShiftLeft: "shift",
      ShiftRight: "shift",
      Backspace: "backspace",
      Tab: "tab",
      Minus: "minus",
      Equal: "equals",
      BracketLeft: "bracket_open",
      BracketRight: "bracket_close",
      Semicolon: "semicolon",
      Quote: "quote",
      Comma: "comma",
      Period: "period",
      Slash: "slash_forward",
      Backslash: "slash_back",
      Backquote: "tilde",
    };

    let baseName = maps[key] || key.replace(/^(Key|Digit)/, "").toLowerCase();

    if (isMac) {
      if (baseName === "win") baseName = "command";
      if (baseName === "alt") baseName = "option";
    }

    const outlines = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "arrow_down",
      "arrow_left",
      "arrow_right",
      "arrow_up",
      "space",
      "enter",
      "escape",
      "ctrl",
      "alt",
      "win",
      "command",
      "option",
      "shift",
      "backspace",
      "tab",
      "minus",
      "equals",
      "bracket_open",
      "bracket_close",
      "semicolon",
      "quote",
      "comma",
      "period",
      "slash_forward",
      "slash_back",
      "tilde",
    ];

    const suffix = outlines.includes(baseName) ? "_outline" : "";

    return `/assets/kenney_input-prompts_1.4/Keyboard & Mouse/Vector/keyboard_${baseName}${suffix}.svg`;
  });
</script>

<img
  src={imagePath}
  alt="Key"
  class="{size} object-contain select-none"
  style="filter: grayscale(100%) brightness(0) invert(1);"
  draggable="false"
/>
