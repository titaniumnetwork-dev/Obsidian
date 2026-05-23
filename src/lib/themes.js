export const themes = [
  {
    name: "Dark",
    primary: "#171717",
  },
  {
    name: "Light",
    primary: "#fff",
  },
  {
    name: "Valve",
    primary: "#1a9fff",
  },
  {
    name: "Turtle",
    primary: "#028746",
  },
  {
    name: "Nord",
    primary: "##88c0d0",
  },
  {
    name: "Fractal",
    primary: "#f971e4",
  },
  {
    name: "Molten",
    primary: "#ff6868",
  },
  {
    name: "Metallic",
    primary: "#2a7152",
  },
  {
    name: "Catppuccin Mocha",
    primary: "#89b4fa",
  },
  {
    name: "Catppuccin Macchiato",
    primary: "#8aadf4",
  },
  {
    name: "Catppuccin Frappé",
    primary: "#8caaee",
  },
  {
    name: "Catppuccin Latte",
    primary: "#1e66f5",
  },
  {
    name: "3kh0",
    primary: "#4caf50",
    hidden: true,
    css: {
      ".sidebar-search": {
        position: "relative",
      },
      ".sidebar-search::before": {
        content: "''",
        position: "absolute",
        inset: " -96px 0 auto 0",
        height: "100px",
        "background-color": "var(--color-primary)",
        filter: "blur(80px)",
        opacity: "0.6",
        "pointer-events": "none",
      },
    },
  },
  {
    name: "Space",
    primary: "#1d4ed8",
    hidden: true,
    css: {
      ".logo": {
        filter: "drop-shadow(0 0 64px var(--color-primary))",
      },
    },
  },
  {
    name: "Snail",
    primary: "#ff637f",
    hidden: true,
  },
];
