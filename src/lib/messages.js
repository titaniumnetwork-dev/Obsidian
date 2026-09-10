const messages = [
  "Welcome to Obsidian",
  "Remember 3kh0?",
  "We love Truffled ❤️",
  "Batteries not included",
  "You get a cookie!",
  "Join the Discord",
  "Made you look!",
  "What is your high score on Slope?",
  "Since 2026!",
  "Made by Nebelung!",
  "splash text",
  "Batteries not included",
  "Are you a real gamer?",
  "git gud!",
  "shaw!",
  "No fun allowed",
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
  "Secret themes?",
  "Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently.",
  "meow",
  "Ahead of the competition",
  "Crazy? I was crazy once, They locked me in a room, a rubber room, a rubber room with rats, and rats make me crazy.",
  "Literally 1984",
  "The lag is due to your chromebook I'm sorry",
];

let availablePool = [];

export function getMessage() {
  if (availablePool.length === 0) {
    availablePool = [...messages];
  }

  const randomIndex = Math.floor(Math.random() * availablePool.length);

  return availablePool.splice(randomIndex, 1)[0];
}
