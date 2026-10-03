<script>
  import "#lib/style/layout.css";
  import { onMount } from "svelte";

  let { data } = $props();

  let container;
  let player;

  onMount(() => {
    window.RufflePlayer = window.RufflePlayer || {};
    window.RufflePlayer.config = {
      publicPath: "/ruffle/",
      autoplay: "on",
      splashScreen: false,
      unmuteOverlay: "hidden",
      letterbox: "on",
      contextMenu: "off",
    };

    function initPlayer() {
      const ruffle = window.RufflePlayer.newest();
      player = ruffle.createPlayer();
      container.appendChild(player);
      player.load(window.location.origin + "/" + data.swf);
    }

    $effect(() => {
      if (window.RufflePlayer?.newest) {
        initPlayer();
      } else {
        let script = document.querySelector('script[src="/ruffle/ruffle.js"]');
        if (!script) {
          script = document.createElement("script");
          script.src = "/ruffle/ruffle.js";
          document.head.appendChild(script);
        }
        script.addEventListener("load", initPlayer);
      }

      return () => {
        if (container && player) {
          container.removeChild(player);
          player = null;
        }

        const script = document.querySelector(
          'script[src="/ruffle/ruffle.js"]',
        );
        if (script) {
          script.removeEventListener("load", initPlayer);
        }
      };
    });
  });
</script>

<div
  bind:this={container}
  class="w-full h-full bg-black flex items-center justify-center [&_ruffle-player]:w-full [&_ruffle-player]:h-full"
></div>
