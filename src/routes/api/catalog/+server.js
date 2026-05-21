import { json } from "@sveltejs/kit";

export async function GET({ setHeaders, platform }) {
  setHeaders({
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    "Content-Type": "application/json",
  });

  /*
  const bucket = platform?.env?.GAMES;

  if (!bucket) {
    console.error("Cloudflare R2 bucket binding not found.");
    return json([]);
  }

  const r2Object = await bucket.get("catalog.json");

  if (!r2Object) {
    console.error("Catalog file not found in R2.");
    return json([]);
  }

  return new Response(r2Object.body);
  */
  return json([
    {
      title: "Balatro",
      developer: "LocalThunk",
      description:
        "The poker roguelike. Balatro is a hypnotically satisfying deckbuilder where you play illegal poker hands, discover game-changing jokers, and trigger adrenaline-pumping, outrageous combos.",
      id: "6f324fd5-98e0-4184-9d0e-78b75febe17b",
      type: "HTML",
      controls: [
        {
          action: "Options",
          keys: [{ key: "Escape", keyCode: 27 }],
        },
      ],
      gamepadControls: [
        {
          action: "Select",
          buttons: [0],
        },
        {
          action: "Play Hand",
          buttons: [2],
        },
        {
          action: "Discard Hand",
          buttons: [3],
        },
        {
          action: "Cancel",
          buttons: [1],
        },
        {
          action: "View Deck",
          buttons: [7],
        },
        {
          action: "Peek Deck",
          buttons: [6],
          type: "hold",
        },
        {
          action: "Run Info",
          buttons: [8],
        },
        {
          action: "Options",
          buttons: [9],
        },
        {
          action: "Move Up",
          buttons: [12],
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Move Down",
          buttons: [13],
          axes: [{ index: 1, direction: 1 }],
        },
        {
          action: "Move Left",
          buttons: [14],
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Move Right",
          buttons: [15],
          axes: [{ index: 0, direction: 1 }],
        },
      ],
      tags: [
        "Deckbuilder",
        "Roguelike",
        "RPG",
        "Singleplayer",
        "Strategy",
        "Card Game",
      ],
      controllerSupport: true,
      version: "1.0.1o-FULL",
      path: "/index.html",
    },
    {
      title: "Cookie Clicker",
      developer: "Orteil",
      description:
        "Cookie Clicker was created by French programmer Julien Orteil Thiennot in 2013. The user clicks a big cookie on the screen, starting at 1 cookie per click.",
      id: "db2fd199-a687-4055-818b-6aac58f4f070",
      type: "HTML",
      tags: [
        "Casual",
        "Incremental",
        "Idle",
        "Singleplayer",
        "Clicker",
        "Strategy",
      ],
      controllerSupport: false,
      version: "2.022",
      path: "/index.html",
    },
    {
      title: "Cut the Rope",
      developer: "ZeptoLab",
      description:
        "Cut the Rope to feed large pieces of candy to a hungry creature called Om Nom. Collect all the stars for the highest rating and progress to more challenging levels with new puzzles.",
      id: "5beca41c-e780-4487-8529-97a178c181cc",
      type: "HTML",
      tags: ["2D", "Puzzle", "Casual", "Cute", "Indie", "Arcade"],
      controllerSupport: false,
      internalVersion: "1",
      path: "/index.html",
    },
    {
      title: "Duck Life",
      developer: "Wix Games",
      description:
        "The future of the Duck Life farm is in your hands. Train your duck to run, fly, and swim its way to victory so you can save the farm. Level up your duck through the different training courses until its skills are sharp enough to enter a race.",
      id: "981cbfa8-705a-4983-90ed-0615ec65cd4a",
      type: "Flash",
      controls: [
        {
          action: "Move Left/Move Up",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
          ],
        },
        {
          action: "Move Right/Move Down",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
          ],
        },
        {
          action: "Jump",
          keys: [
            {
              key: "ArrowUp",
              keyCode: 38,
            },
          ],
        },
        {
          action: "Dive",
          keys: [
            {
              key: "ArrowDown",
              keyCode: 40,
            },
          ],
        },
        {
          action: "Start/Retry",
          keys: [
            {
              key: " ",
              keyCode: 32,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Move Left/Move Up",
          buttons: [14],
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Move Right/Move Down",
          buttons: [15],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Jump",
          buttons: [0, 12],
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Dive",
          buttons: [13],
          axes: [{ index: 1, direction: 1 }],
        },
        {
          action: "Start/Retry",
          buttons: [2, 9],
        },
      ],
      tags: ["Casual", "Simulation", "Singleplayer", "Cartoon", "Retro"],
      controllerSupport: false,
      internalVersion: "1",
    },
    {
      title: "Duck Life 2: World Champion",
      developer: "Wix Games",
      description:
        "Collect coins and earn upgrades to help your duck become world champion. Duck Life 2 is all about using your resources wisely to become the best athlete you can be.",
      id: "d402c55c-04f2-44b4-bc0e-195c327a9fd0",
      type: "Flash",
      controls: [
        {
          action: "Move Left/Move Up",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
          ],
        },
        {
          action: "Move Right/Move Down",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
          ],
        },
        {
          action: "Jump",
          keys: [
            {
              key: "ArrowUp",
              keyCode: 38,
            },
          ],
        },
        {
          action: "Dive",
          keys: [
            {
              key: "ArrowDown",
              keyCode: 40,
            },
          ],
        },
        {
          action: "Start/Retry",
          keys: [
            {
              key: "Space",
              keyCode: 32,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Move Left/Move Up",
          buttons: [14],
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Move Right/Move Down",
          buttons: [15],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Jump",
          buttons: [0, 12],
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Dive",
          buttons: [13],
          axes: [{ index: 1, direction: 1 }],
        },
        {
          action: "Start/Retry",
          buttons: [2, 9],
        },
      ],
      tags: ["Casual", "Simulation", "Singleplayer", "Cartoon", "Retro"],
      controllerSupport: false,
      internalVersion: "1",
    },
    {
      title: "Duck Life 3: Evolution",
      developer: "Wix Games",
      description:
        "Duck Life 3 is a duck racing game featuring genetically modified ducks that evolve as you progress. Choose from one of four duck breeds and evolve as you complete each league.",
      id: "263c2b5b-297c-4f04-8e0a-70ba1917a7d0",
      type: "Flash",
      controls: [
        {
          action: "Move Left/Move Up",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
          ],
        },
        {
          action: "Move Right/Move Down",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
          ],
        },
        {
          action: "Jump",
          keys: [
            {
              key: "ArrowUp",
              keyCode: 38,
            },
          ],
        },
        {
          action: "Dive",
          keys: [
            {
              key: "ArrowDown",
              keyCode: 40,
            },
          ],
        },
        {
          action: "Start/Retry",
          keys: [
            {
              key: "Space",
              keyCode: 32,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Move Left/Move Up",
          buttons: [14],
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Move Right/Move Down",
          buttons: [15],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Jump",
          buttons: [0, 12],
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Dive",
          buttons: [13],
          axes: [{ index: 1, direction: 1 }],
        },
        {
          action: "Start/Retry",
          buttons: [2, 9],
        },
      ],
      tags: ["Casual", "Simulation", "Singleplayer", "Cartoon", "Retro"],
      controllerSupport: false,
      internalVersion: "1",
    },
    {
      title: "Duck Life 4",
      developer: "Wix Games",
      description:
        "Duck Life 4 is a duck racing game set after the ban on genetically modified ducks. A year has passed since the ban on genetically modified ducks and now it's up to you to defeat the world champion. Train your duck team to compete in six new locations around the world.",
      id: "97ce8e75-4a73-44a5-95e5-b45ed5b0fc36",
      type: "Flash",
      controls: [
        {
          action: "Move Left/Move Up",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
          ],
        },
        {
          action: "Move Right/Move Down",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
          ],
        },
        {
          action: "Jump",
          keys: [
            {
              key: "ArrowUp",
              keyCode: 38,
            },
          ],
        },
        {
          action: "Dive",
          keys: [
            {
              key: "ArrowDown",
              keyCode: 40,
            },
          ],
        },
        {
          action: "Start/Retry",
          keys: [
            {
              key: "Space",
              keyCode: 32,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Move Left/Move Up",
          buttons: [14],
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Move Right/Move Down",
          buttons: [15],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Jump",
          buttons: [0, 12],
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Dive",
          buttons: [13],
          axes: [{ index: 1, direction: 1 }],
        },
        {
          action: "Start/Retry",
          buttons: [2, 9],
        },
      ],
      tags: ["Casual", "Simulation", "Singleplayer", "Cartoon", "Retro"],
      controllerSupport: false,
      internalVersion: "1",
    },
    {
      title: "Moto X3M",
      developer: "Madpuffers",
      description:
        "Moto X3M is an awesome 2D bike racing simulation with challenging levels. Grab your motorbike, strap on your helmet, and catch some airtime over obstacles as you beat the clock on amazing off-road circuits.",
      id: "bc64c4a5-c685-4b8f-a94f-3995de5a2497",
      type: "HTML",
      controls: [
        {
          action: "Pause",
          keys: [
            {
              key: "KeyP",
              keyCode: 80,
            },
          ],
        },
        {
          action: "Reset",
          keys: [
            {
              key: "KeyR",
              keyCode: 82,
            },
          ],
        },
        {
          action: "Retry",
          keys: [
            {
              key: "Space",
              keyCode: 32,
            },
          ],
        },
        {
          action: "Forward",
          keys: [
            {
              key: "ArrowUp",
              keyCode: 38,
            },
            {
              key: "KeyW",
              keyCode: 87,
            },
          ],
        },
        {
          action: "Backward",
          keys: [
            {
              key: "ArrowDown",
              keyCode: 40,
            },
            {
              key: "KeyS",
              keyCode: 83,
            },
          ],
        },
        {
          action: "Rotate Forward",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
            {
              key: "KeyD",
              keyCode: 68,
            },
          ],
        },
        {
          action: "Rotate Backward",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
            {
              key: "KeyA",
              keyCode: 65,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Pause",
          buttons: [9],
        },
        {
          action: "Reset",
          buttons: [1],
        },
        {
          action: "Retry",
          buttons: [0],
        },
        {
          action: "Forward",
          buttons: [15, 7],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Backward",
          buttons: [14, 6],
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Rotate Forward",
          buttons: [3],
        },
        {
          action: "Rotate Backward",
          buttons: [2],
        },
      ],
      tags: ["Action", "2D", "Driving", "Physics", "Sports"],
      controllerSupport: false,
      version: "1.1.1c",
      path: "/index.html",
    },
    {
      title: "Run 3",
      developer: "Joseph Cloutier",
      description:
        "Run 3 is an exciting platformer where you run, jump through an endless tunnel in space. Pass all challenges of hundred levels without falling into space.",
      id: "01b8559e-7a81-4664-94bd-624fb4c11c7b",
      type: "HTML",
      controls: [
        {
          action: "Jump",
          keys: [
            {
              key: "Space",
              keyCode: 32,
            },
            {
              key: "ArrowUp",
              keyCode: 38,
            },
            {
              key: "KeyW",
              keyCode: 87,
            },
          ],
        },
        {
          action: "Move Right",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
            {
              key: "KeyD",
              keyCode: 68,
            },
            {
              key: "KeyE",
              keyCode: 69,
            },
          ],
        },
        {
          action: "Move Left",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
            {
              key: "KeyA",
              keyCode: 65,
            },
            {
              key: "KeyQ",
              keyCode: 81,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Jump",
          buttons: [0, 12],
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Move Right",
          buttons: [15, 5],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Move Left",
          buttons: [14, 4],
          axes: [{ index: 0, direction: -1 }],
        },
      ],
      tags: ["Action", "Endless", "Retro", "3D", "3D Platformer", "Space"],
      controllerSupport: false,
      version: "2.0.2",
      path: "/index.html",
    },
    {
      title: "Slope",
      developer: "Rob Kay",
      description:
        "Slope is a fast-paced, endless runner where you control a ball rolling down a never-ending slope. The objective? Avoid falling off the edges or colliding with obstacles while the speed keeps increasing!",
      id: "52670c5c-f85c-44b2-8306-8d6381466199",
      type: "HTML",
      controls: [
        {
          action: "Move Right",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
            {
              key: "KeyD",
              keyCode: 68,
            },
            {
              key: "KeyE",
              keyCode: 69,
            },
          ],
        },
        {
          action: "Move Left",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
            {
              key: "KeyA",
              keyCode: 65,
            },
            {
              key: "KeyQ",
              keyCode: 81,
            },
          ],
        },
        {
          action: "Retry",
          keys: [
            {
              key: "Enter",
              keyCode: 13,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Move Right",
          buttons: [15],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Move Left",
          buttons: [14],
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Retry",
          buttons: [0],
        },
      ],
      tags: ["Endless", "Arcade", "Action", "Retro", "3D"],
      controllerSupport: false,
      internalVersion: "1",
      path: "/index.html",
    },
    {
      title: "SUPERHOT",
      developer: "SUPERHOT Team",
      description:
        "SUPERHOT is the smash-hit FPS where time moves only when you move. No regenerating health bars. No conveniently placed ammo drops. It's you, alone, outnumbered and outgunned. Snatch weapons from fallen enemies to shoot, slice and dodge through a truly cinematic hurricane of slow-motion bullets.",
      id: "0abcc623-ec00-493a-9139-e23b85071e5a",
      type: "HTML",
      controls: [
        {
          action: "Move Forward",
          keys: [
            {
              key: "ArrowUp",
              keyCode: 38,
            },
            {
              key: "KeyW",
              keyCode: 87,
            },
          ],
        },
        {
          action: "Move Backward",
          keys: [
            {
              key: "ArrowDown",
              keyCode: 40,
            },
            {
              key: "KeyS",
              keyCode: 83,
            },
          ],
        },
        {
          action: "Move Left",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
            {
              key: "KeyA",
              keyCode: 65,
            },
          ],
        },
        {
          action: "Move Right",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
            {
              key: "KeyD",
              keyCode: 68,
            },
          ],
        },
        {
          action: "Jump",
          keys: [
            {
              key: " ",
              keyCode: 32,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Move Forward",
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Move Backward",
          axes: [{ index: 1, direction: 1 }],
        },
        {
          action: "Move Left",
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Move Right",
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Jump",
          buttons: [3],
        },
      ],
      tags: ["FPS", "Action", "Stylized", "Singleplayer", "3D", "Shooter"],
      controllerSupport: true,
      internalVersion: "1",
      path: "/index.html",
    },
    {
      title: "This Is The Only Level",
      developer: "jmtb02",
      description:
        "The elephant forgot the rest of the levels, but luckily he still has one left! Help him beat it in all his metagaming glory. Use your keen knowledge of gaming and dexterity to manhandle your way through a variety of challenges.",
      id: "197dbd26-226f-4e26-b5cb-54959ea73753",
      type: "Flash",
      tags: [
        "2D Platformer",
        "Indie",
        "Puzzle",
        "Retro",
        "Stylized",
        "Singleplayer",
      ],
      controllerSupport: false,
      version: "1.0",
    },
    {
      title: "The Legend of Zelda: The Minish Cap",
      developer: "Nintendo",
      description:
        "When the sorcerer Vaati turns Princess Zelda to stone the King of Hyrule sends Link on a quest that will take him to places he's never imagined. Using the power of a mystical hat called the Minish Cap, the Hylian hero will shrink down for a massive quest... on a microscopic scale!",
      id: "18f75fb2-6614-4ee9-88b5-a32c8f36b9ee",
      type: "Emulation",
      controls: [
        {
          action: "Up",
          keys: [
            {
              key: "ArrowUp",
              keyCode: 38,
            },
          ],
        },
        {
          action: "Down",
          keys: [
            {
              key: "ArrowDown",
              keyCode: 40,
            },
          ],
        },
        {
          action: "Left",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
          ],
        },
        {
          action: "Right",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
          ],
        },
        {
          action: "A",
          keys: [
            {
              key: "KeyZ",
              keyCode: 90,
            },
          ],
        },
        {
          action: "B",
          keys: [
            {
              key: "KeyX",
              keyCode: 88,
            },
          ],
        },
        {
          action: "L",
          keys: [
            {
              key: "KeyQ",
              keyCode: 81,
            },
          ],
        },
        {
          action: "R",
          keys: [
            {
              key: "KeyE",
              keyCode: 69,
            },
          ],
        },
        {
          action: "Select",
          keys: [
            {
              key: "KeyV",
              keyCode: 86,
            },
          ],
        },
        {
          action: "Enter",
          keys: [
            {
              key: "Enter",
              keyCode: 13,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Up",
          buttons: [12],
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Down",
          buttons: [13],
          axes: [{ index: 1, direction: 1 }],
        },
        {
          action: "Left",
          buttons: [14],
          axes: [{ index: 0, direction: -1 }],
        },
        {
          action: "Right",
          buttons: [15],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "A",
          buttons: [0],
        },
        {
          action: "B",
          buttons: [1, 2],
        },
        {
          action: "L",
          buttons: [4],
        },
        {
          action: "R",
          buttons: [5],
        },
        {
          action: "Select",
          buttons: [8],
        },
        {
          action: "Enter",
          buttons: [9],
        },
      ],
      tags: [
        "Action-Adventure",
        "Adventure",
        "Fantasy",
        "Pixel Graphics",
        "Indie",
        "Retro",
      ],
      controllerSupport: false,
      internalVersion: "1",
      rom: "/18f75fb2-6614-4ee9-88b5-a32c8f36b9ee.gba",
    },
    {
      title: "Vex 3",
      developer: "AmazingAdam",
      description:
        "Vex 3 is a challenging 2D platformer where you navigate a stickman through a series of deadly obstacles, traps, and parkour puzzles. Run, jump, slide, and wall-climb your way to survive each intense act.",
      id: "4466a2be-dd7f-4170-82ed-548d9f31fc4f",
      type: "HTML",
      controls: [
        {
          action: "Jump/Swim/Cannon",
          keys: [
            {
              key: "ArrowUp",
              keyCode: 38,
            },
            {
              key: "KeyW",
              keyCode: 87,
            },
          ],
        },
        {
          action: "Crouch/Slide/Enter",
          keys: [
            {
              key: "ArrowDown",
              keyCode: 40,
            },
            {
              key: "KeyS",
              keyCode: 83,
            },
          ],
        },
        {
          action: "Move Right",
          keys: [
            {
              key: "ArrowRight",
              keyCode: 39,
            },
            {
              key: "KeyD",
              keyCode: 68,
            },
          ],
        },
        {
          action: "Move Left",
          keys: [
            {
              key: "ArrowLeft",
              keyCode: 37,
            },
            {
              key: "KeyA",
              keyCode: 65,
            },
          ],
        },
      ],
      gamepadControls: [
        {
          action: "Jump/Swim/Cannon",
          buttons: [0, 12],
          axes: [{ index: 1, direction: -1 }],
        },
        {
          action: "Crouch/Slide/Enter",
          buttons: [1, 13],
          axes: [{ index: 1, direction: 1 }],
        },
        {
          action: "Move Right",
          buttons: [15],
          axes: [{ index: 0, direction: 1 }],
        },
        {
          action: "Move Left",
          buttons: [14],
          axes: [{ index: 0, direction: -1 }],
        },
      ],
      tags: [
        "2D",
        "2D Platformer",
        "Action",
        "Difficult",
        "Platformer",
        "Minimalist",
      ],
      controllerSupport: false,
      version: "16",
      path: "/index.html",
    },
  ]);
}
