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
    name: "Sunset",
    primary: "#ff7e5f",
  },
  {
    name: "Zen",
    primary: "#d1cfc0",
  },
  {
    name: "OLED",
    primary: "#000000",
  },
  {
    name: "3kh0",
    primary: "#4caf50",
    hidden: true,
    css: {
      ".sidebar": {
        position: "relative",
      },
      ".sidebar::before": {
        content: "''",
        "box-shadow": "0 5px 200px var(--color-primary)",
        width: "100%",
        height: "100%",
        transform: "translateY(-100%)",
        position: "absolute",
      },
      ".sidebar > :first-child": {
        background: "transparent",
      },
    },
  },
  {
    name: "Truffle",
    primary: "#ffffff",
    hidden: true,
    css: {
      body: {
        "background-image":
          "linear-gradient(to right, #192525 1px, transparent 1px), linear-gradient(to bottom, #192525 1px, transparent 1px)",
        "background-size": "3rem 3rem",
        "background-position": "center",
      },
    },
  },
  {
    name: "Space",
    primary: "#1d4ed8",
    hidden: true,
    css: {
      ".logo": {
        filter: "drop-shadow(0 0 32px var(--color-primary))",
      },
    },
  },
  {
    name: "Snail",
    primary: "#ff637f",
    hidden: true,
  },
  {
    name: "Lime",
    primary: "#d8fa99",
    hidden: true,
  },
];
