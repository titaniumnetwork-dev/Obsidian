<script>
  import { storage } from "$lib/storage.svelte";
  import { themes } from "$lib/themes";
  import { css } from "@codemirror/lang-css";
  import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { EditorView } from "@codemirror/view";
  import { tags as t } from "@lezer/highlight";
  import { color } from "@uiw/codemirror-extensions-color";
  import CodeMirror from "svelte-codemirror-editor";

  const disableGrammarly = EditorView.contentAttributes.of({
    "data-gramm": "false",
  });

  export const customTheme = EditorView.theme({
    "&": {
      color: "var(--color-text)",
      backgroundColor: "var(--color-secondary)",
      minHeight: "16rem",
    },
    ".cm-scroller": {
      overflow: "auto",
      padding: "0.25rem",
    },
    ".cm-content": {
      caretColor: "var(--color-text)",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--color-text)" },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "Highlight" },

    ".cm-selectionMatch": {
      backgroundColor: "Highlight",
    },
    ".cm-activeLine": { backgroundColor: "transparent" },
    ".cm-gutters": {
      backgroundColor: "var(--color-secondary)",
      color: "var(--color-text-placeholder)",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--color-secondary)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: "var(--color-text)",
    },
    ".cm-tooltip": {
      border: "1px solid var(--color-border)",
      backgroundColor: "var(--color-secondary)",
      borderRadius: "0.75rem",
      overflow: "hidden",
      color: "var(--color-text)",
    },
    ".cm-completionLabel": {
      color: "var(--color-text)",
    },
    ".cm-completionMatchedText": {
      textDecoration: "none",
      color: "var(--color-text)",
    },
    ".cm-tooltip-autocomplete > ul > li": {
      padding: "6px 8px !important",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "var(--color-surface)",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      minWidth: "24px",
    },
    ".cm-completionIcon": { display: "none" },
  });

  const highlighting = HighlightStyle.define([
    {
      tag: [t.keyword, t.function(t.variableName), t.tagName, t.heading],
      color: "var(--theme-primary)",
    },
    {
      tag: [t.string, t.className, t.constant(t.name), t.attributeName],
      color: "var(--theme-text-placeholder)",
    },
    {
      tag: [t.name, t.propertyName, t.operator, t.punctuation],
      color: "var(--theme-text)",
    },
    {
      tag: [t.comment, t.meta],
      color:
        "color-mix(in oklab, var(--theme-text-placeholder) 60%, transparent)",
    },
    {
      tag: t.invalid,
      color: "red",
      textDecoration: "underline wavy",
    },
  ]);

  const customSyntaxTheme = syntaxHighlighting(highlighting);
</script>

<p>Theme</p>
<p class="text-sm text-text-placeholder mb-4">Change the look of Obsidian</p>
<div class="flex flex-wrap gap-4">
  {#each themes as theme}
    {#if !theme.hidden || storage.hiddenThemes.includes(theme.name)}
      <button
        onclick={() => storage.updateTheme(theme.name)}
        data-active={storage.theme === theme.name}
        class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap transition-colors data-[active=true]:bg-surface flex gap-2 items-center border border-border"
      >
        <div
          style={"background: " + theme.primary}
          class="h-4 w-4 rounded-full border border-border"
        ></div>
        <span>{theme.name}</span>
      </button>
    {/if}
  {/each}
</div>
<p class="mt-4">Custom CSS</p>
<p class="text-sm text-text-placeholder mb-4">Ultimate customizability</p>
<div
  class="editor-container max-w-xl rounded-2xl overflow-hidden border border-border bg-secondary"
>
  <CodeMirror
    theme={[customTheme, customSyntaxTheme]}
    extensions={[color, disableGrammarly]}
    lineWrapping={true}
    onchange={(value) => storage.updateSetting("customCSS", value)}
    value={storage.settings.customCSS}
    lang={css()}
  />
</div>
