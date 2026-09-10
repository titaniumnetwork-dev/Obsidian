<script>
  import { goto } from "$app/navigation";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import { storage } from "$lib/storage.svelte";
  import { themes } from "$lib/themes";
  import { css } from "@codemirror/lang-css";
  import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { EditorView } from "@codemirror/view";
  import { tags as t } from "@lezer/highlight";
  import { Key, Sparkles } from "@lucide/svelte";
  import { color } from "@uiw/codemirror-extensions-color";
  import CodeMirror from "svelte-codemirror-editor";
  import { toast } from "svelte-sonner";

  const disableGrammarly = EditorView.contentAttributes.of({
    "data-gramm": "false",
  });

  export const customTheme = EditorView.theme({
    "&": {
      color: "var(--theme-foreground)",
      backgroundColor: "var(--theme-secondary)",
      minHeight: "16rem",
    },
    ".cm-scroller": {
      overflow: "auto",
      padding: "0.25rem",
    },
    ".cm-content": {
      caretColor: "var(--theme-foreground)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--theme-foreground)",
    },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "Highlight" },

    ".cm-selectionMatch": {
      backgroundColor: "Highlight",
    },
    ".cm-activeLine": { backgroundColor: "transparent" },
    ".cm-gutters": {
      backgroundColor: "var(--theme-secondary)",
      color: "var(--theme-muted)",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--theme-secondary)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: "var(--theme-foreground)",
    },
    ".cm-tooltip": {
      border: "1px solid var(--theme-border)",
      backgroundColor: "var(--theme-secondary)",
      borderRadius: "0.75rem",
      overflow: "hidden",
      color: "var(--theme-foreground)",
    },
    ".cm-completionLabel": {
      color: "var(--theme-foreground)",
    },
    ".cm-completionMatchedText": {
      textDecoration: "none",
      color: "var(--theme-foreground)",
    },
    ".cm-tooltip-autocomplete > ul > li": {
      padding: "6px 8px !important",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "var(--theme-input)",
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
      color: "var(--theme-muted)",
    },
    {
      tag: [t.name, t.propertyName, t.operator, t.punctuation],
      color: "var(--theme-foreground)",
    },
    {
      tag: [t.comment, t.meta],
      color: "color-mix(in oklab, var(--theme-muted) 60%, transparent)",
    },
    {
      tag: t.invalid,
      color: "red",
      textDecoration: "underline wavy",
    },
  ]);

  const customSyntaxTheme = syntaxHighlighting(highlighting);

  function unlockTruffle() {
    if (!storage.hiddenThemes.includes("Truffle")) {
      storage.addHiddenTheme("Truffle");
      storage.updateTheme("Truffle");
      toast("Theme Unlocked", {
        description: "You unlocked the Truffle theme!",
        position: "bottom-center",
        icon: Sparkles,
        action: {
          label: "Settings",
          onClick: () => goto("/settings/appearance"),
        },
      });
    }
  }

  const unlockedHiddenThemes = $derived(
    themes
      .filter((theme) => theme.hidden)
      .filter((theme) => storage.hiddenThemes.includes(theme.name)).length,
  );
  const allHiddenThemes = $derived(
    themes.filter((theme) => theme.hidden).length,
  );

  const roundings = ["Sharp", "Default", "Soft"];
</script>

<div class="grid grid-cols-2 gap-4">
  <Card size="sm">
    <div class="flex justify-between">
      <div>
        <p>Themes</p>
        <p class="text-sm text-muted">Change the look of Obsidian</p>
      </div>
      {#if !storage.hiddenThemes.includes("Truffle")}
        <button onclick={unlockTruffle} class="cursor-pointer h-fit">
          <Key class="text-muted" size="16" />
        </button>
      {/if}
    </div>
    <div class="flex flex-wrap gap-2">
      {#each themes as theme}
        {#if !theme.hidden}
          <Button
            variant="ghost"
            onclick={() => storage.updateTheme(theme.name)}
            data-active={storage.theme === theme.name}
            class="data-[active=true]:bg-secondary border border-border"
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
    {#if storage.hiddenThemes.length > 0}
      <div>
        <p>Hidden Themes ({unlockedHiddenThemes}/{allHiddenThemes})</p>
        <p class="text-sm text-muted">
          Search around the site for these secret themes
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        {#each themes as theme}
          {#if theme.hidden && storage.hiddenThemes.includes(theme.name)}
            <Button
              variant="ghost"
              onclick={() => storage.updateTheme(theme.name)}
              data-active={storage.theme === theme.name}
              class="data-[active=true]:bg-secondary border border-border"
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
    {/if}
  </Card>
  <Card size="sm">
    <div>
      <p>Rounding</p>
      <p class="text-sm text-muted">Change the rounding of everything</p>
    </div>
    <div class="flex flex-wrap gap-2">
      {#each roundings as rounding}
        <Button
          variant="ghost"
          onclick={() => storage.updateRounding(rounding)}
          data-active={storage.rounding === rounding}
          class="data-[active=true]:bg-secondary border border-border"
        >
          <span>{rounding}</span>
        </Button>
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
