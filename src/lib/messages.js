const messages = [
  "Welcome to Obsidian",
  "Remember 3kh0?",
  "Truffled love",
  "Batteries not included",
  "You get a cookie!",
  "Join the Discord",
  "Made you look!",
  "What is your highscore on Slope?",
  "Since 2026!",
  "100% Organic!",
  "Made by Nebelung!",
  "splash text",
  "Batteries not included",
  "Are you a gaemer?",
  "Mom get out of my room!",
  "git gud",
  "No fun allowed",
  "Too cool for school",
  "Ping: 1ms",
  "The Duolingo owl is coming for you",
  "Don't blink!",
  "The cake is a lie",
  "Lorem ipsum",
  "You are reading this",
  "Don't believe everything you read on the internet.",
  "Alt+Tab champion",
  "It's dangerous to go alone! Take this.",
  "Waka waka waka...",
  "Insert Coin",
  "The princess is in another castle!",
  "As seen on TV!",
];

let availablePool = [];

export function getMessage() {
  if (availablePool.length === 0) {
    availablePool = [...messages];
  }

  const randomIndex = Math.floor(Math.random() * availablePool.length);

  return availablePool.splice(randomIndex, 1)[0];
}
