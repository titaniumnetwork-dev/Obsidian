export function keyIcon(code) {
  const specialKeyIcons = {
    ArrowRight: "→",
    ArrowLeft: "←",
    ArrowUp: "↑",
    ArrowDown: "↓",
    Space: "␣",
    Enter: "↵",
    Escape: "Esc",
    ShiftLeft: "⇧ Shift",
    ShiftRight: "⇧ Shift",
    ControlLeft: "⌃ Ctrl",
    ControlRight: "⌃ Ctrl",
    AltLeft: "Alt",
    AltRight: "Alt",
    MetaLeft: "Cmd",
    MetaRight: "Cmd",
    Backspace: "⌫",
    Backquote: "`",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
    Semicolon: ";",
    Quote: "'",
    Slash: "/",
    Period: ".",
    Comma: ",",
    CapsLock: "Caps",
  };

  if (specialKeyIcons[code]) {
    return specialKeyIcons[code];
  }

  if (code.startsWith("Key")) {
    return code.replace("Key", "");
  }

  if (code.startsWith("Digit")) {
    return code.replace("Digit", "");
  }

  if (code.startsWith("Numpad")) {
    return code.replace("Numpad", "Num ");
  }

  return code;
}
