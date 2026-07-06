<script>
  import { goto } from "$app/navigation";
  import { storage } from "$lib/storage.svelte";
  import { AppWindow, Snail, Sparkles } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  let isPlaying = $state(false);
  let isGameOver = $state(false);

  let score = $state(0);
  let rawScore = 0;
  let highScore = $state(0);

  $effect(() => {
    const savedHighScore = localStorage.getItem("snailHighScore");
    if (savedHighScore) {
      highScore = parseInt(savedHighScore, 10);
    }
  });

  let snailY = $state(0);
  let velocityY = $state(0);
  let isJumping = $state(false);
  const GRAVITY = 0.6;
  const JUMP_VELOCITY = 10;

  let obstacles = $state([]);
  let nextSpawnGap = 300;
  const INITIAL_SPEED = 4.5;
  let gameSpeed = INITIAL_SPEED;
  const CONTAINER_WIDTH = 384;

  let lastTime = 0;
  let animationFrameId;

  function startGame() {
    isPlaying = true;
    isGameOver = false;
    score = 0;
    rawScore = 0;
    snailY = 0;
    velocityY = 0;
    isJumping = false;
    obstacles = [{ x: CONTAINER_WIDTH }];
    gameSpeed = INITIAL_SPEED;
    nextSpawnGap = 300;
    lastTime = 0;

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function jump() {
    if (isGameOver) {
      startGame();
      return;
    }
    if (!isPlaying) startGame();

    if (!isJumping) {
      isJumping = true;
      velocityY = JUMP_VELOCITY;
    }
  }

  function stopJump() {
    if (isJumping && velocityY > 0) velocityY *= 0.5;
  }

  function gameLoop(currentTime) {
    if (!isPlaying) return;
    if (lastTime === 0) lastTime = currentTime;

    let deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    if (deltaTime > 100) deltaTime = 16.66;
    let timeScale = deltaTime / (1000 / 60);

    rawScore += gameSpeed * timeScale * 0.05;

    if (rawScore >= 100000) {
      rawScore = 0;
    }

    score = Math.floor(rawScore);

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snailHighScore", highScore.toString());
    }

    if (isJumping) {
      velocityY -= GRAVITY * timeScale;
      snailY += velocityY * timeScale;
      if (snailY <= 0 && velocityY < 0) {
        snailY = 0;
        velocityY = 0;
        isJumping = false;
      }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= gameSpeed * timeScale;

      if (obstacles[i].x < -50) {
        obstacles.splice(i, 1);
        if (gameSpeed < 14) {
          gameSpeed += 0.08;
        }
      }
    }

    let lastObs = obstacles[obstacles.length - 1];
    if (!lastObs || CONTAINER_WIDTH - lastObs.x >= nextSpawnGap) {
      obstacles.push({ x: CONTAINER_WIDTH });
      let minSafeGap = 150 + gameSpeed * 12;
      nextSpawnGap = Math.random() * 150 + minSafeGap;
    }

    let playerCircle = {
      x: 10 + 15,
      y: snailY + 16,
      r: 13,
    };

    for (let obs of obstacles) {
      let obsBox = {
        left: obs.x + 1,
        right: obs.x + 35,
        bottom: 4,
        top: 32,
      };

      let testX = playerCircle.x;
      let testY = playerCircle.y;

      if (playerCircle.x < obsBox.left) testX = obsBox.left;
      else if (playerCircle.x > obsBox.right) testX = obsBox.right;

      if (playerCircle.y < obsBox.bottom) testY = obsBox.bottom;
      else if (playerCircle.y > obsBox.top) testY = obsBox.top;

      let distX = playerCircle.x - testX;
      let distY = playerCircle.y - testY;
      let distance = Math.sqrt(distX * distX + distY * distY);

      if (distance <= playerCircle.r) {
        gameOver();
        return;
      }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function gameOver() {
    isPlaying = false;
    isGameOver = true;
    cancelAnimationFrame(animationFrameId);
  }

  const JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];

  function handleKeydown(event) {
    if (JUMP_KEYS.includes(event.code)) {
      if (["Space", "ArrowUp"].includes(event.code)) {
        event.preventDefault();
      }
      if (!event.repeat) {
        jump();

        if (!storage.hiddenThemes.includes("Snail")) {
          storage.addHiddenTheme("Snail");
          storage.updateTheme("Snail");
          toast("Theme Unlocked", {
            description: "You unlocked the Snail theme!",
            position: "bottom-center",
            icon: Sparkles,
            action: {
              label: "Settings",
              onClick: () => goto("/settings/appearance"),
            },
          });
        }
      }
    }
  }

  function handleKeyup(event) {
    if (JUMP_KEYS.includes(event.code)) {
      stopJump();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} />

<div class="w-96 h-40 border-b-2 border-input relative overflow-hidden">
  <div class="absolute z-20" style="left: 10px; bottom: {snailY}px;">
    <Snail size="36" />
  </div>

  {#each obstacles as obs}
    <div class="absolute z-10" style="left: {obs.x}px; bottom: 0px;">
      <AppWindow size="36" />
    </div>
  {/each}

  {#if isPlaying || isGameOver}
    <div
      class="absolute top-0 right-0 p-2 leading-none z-30 flex gap-4 tabular-nums"
    >
      {#if highScore > 0}
        <span>HI {highScore.toString().padStart(5, "0")}</span>
      {/if}
      <span>{score.toString().padStart(5, "0")}</span>
    </div>
  {/if}
</div>
