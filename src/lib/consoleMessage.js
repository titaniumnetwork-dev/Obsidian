const logoBase64 = `data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPScxLjEnIHZpZXdCb3g9JzAuMCAwLjAgNzAwLjAgNzAwLjAnIGZpbGw9J25vbmUnIHN0cm9rZT0nbm9uZScgc3Ryb2tlLWxpbmVjYXA9J3NxdWFyZScgc3Ryb2tlLW1pdGVybGltaXQ9JzEwJyB4bWxuczp4bGluaz0naHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48Y2xpcFBhdGggaWQ9J3AuMCc+PHBhdGggZD0nbTAgMGw3MDAuMCAwbDAgNzAwLjBsLTcwMC4wIDBsMCAtNzAwLjB6JyBjbGlwLXJ1bGU9J25vbnplcm8nPjwvcGF0aD48L2NsaXBQYXRoPjxnIGNsaXAtcGF0aD0ndXJsKCNwLjApJz48cGF0aCBmaWxsPScjMDAwMDAwJyBmaWxsLW9wYWNpdHk9JzAuMCcgZD0nbTAgMGw3MDAuMCAwbDAgNzAwLjBsLTcwMC4wIDB6JyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPjwvcGF0aD48cGF0aCBmaWxsPScjZmZmJyBkPSdtMCAzNzkuMzg3NjZsMTI5LjE2Mzk5IDE1OS45MTY2bDQ3NC45OTMxIC05LjU2OTE1M2w5NS44MzE2NjUgLTE3MC44NDk4NWwtMTI5LjE2NCAtMTYyLjY1MTU4bC0xNDUuODMxODIgLTM1LjUzODEzeicgZmlsbC1ydWxlPSdldmVub2RkJz48L3BhdGg+PC9nPjwvc3ZnPg==`;

console.log(
  "%c ",
  `background-image: url("${logoBase64}");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  padding: 64px;`,
);
console.log(
  "%cObsidian",
  `font-size: 36px; font-weight: 700; font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";`,
);
console.log(
  "%cYour new favorite place on the internet!",
  `font-size:16px; font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";`,
);
