<script>
    import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
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
      backgroundColor: "var(--color-secondary)",
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

<div class="grid grid-cols-2 gap-4">
  <Card size="sm">
    <div>
      <p>Theme</p>
      <p class="text-sm text-muted">Change the look of Obsidian</p>
    </div>
    <div class="flex flex-wrap gap-2">
      {#each themes as theme}
        {#if !theme.hidden || storage.hiddenThemes.includes(theme.name)}
          <Button
          variant="outline"
            onclick={() => storage.updateTheme(theme.name)}
            data-active={storage.theme === theme.name}
            class="data-[active=true]:bg-secondary"
          >
            <div
              style={"background: " + theme.primary}
              class="h-4 w-4 rounded-full border border-input"
            ></div>
            <span>{theme.name}</span>
          </Button>
        {/if}
      {/each}
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p>Custom CSS</p>
      <p class="text-sm text-muted">Ultimate customizability</p>
    </div>
    <div
      class="editor-container max-w-xl rounded-lg overflow-hidden border border-border bg-card"
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
  </Card>
</div>
