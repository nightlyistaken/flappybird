import { Canvas } from "https://deno.land/x/sdl2@0.1-alpha.5/src/canvas.ts";

const canvas = new Canvas({
  title: "deno_flappy_bird 🐦",
  height: 800,
  width: 600,
  centered: true,
  fullscreen: false,
  hidden: false,
  resizable: false,
  minimized: false,
  maximized: false,
});

const gravity = 1;

function checkCollision(
  x1,
  y1,
  w1,
  h1,
  x2,
  y2,
  w2,
  h2,
) {
  return !(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2);
}

const font = canvas.loadFont(
  "./fonts/mainfont.ttf",
  128,
  { style: "normal" },
);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const width = Math.round(770 / 20) * 5;
const height = Math.round(169 / 20) * 5;

let playerX = 370;
let playerY = 100;
let is_space = false;

// Score value
let score_value = 0;

const upperPipes = [];
const lowerPipes = [];

const UPPER_PIPE_Y = 0;
const LOWER_PIPE_Y_BASE = 800;
const PIPE_WIDTH = 52;
const PIPE_DISTANCE = 320;
const GAP = 180;

let x_font = 0, y_font = 0;
let gameOver = false;
let intro = true;

upperPipes.push({ x: 800 + PIPE_WIDTH, height: getRandomInt(100, 200) });
upperPipes.push({
  x: 800 + (PIPE_WIDTH * 2) + PIPE_DISTANCE,
  height: getRandomInt(100, 200),
});

// Screen width - Corresponding upper pipe height - Random Gap
lowerPipes.push({
  x: 800 + PIPE_WIDTH,
  height: 800 - upperPipes[0].height - GAP,
});
lowerPipes.push({
  x: 800 + (PIPE_WIDTH * 2) + PIPE_DISTANCE,
  height: 800 - upperPipes[1].height - GAP,
});

const birdSurfaceMidflap = canvas.loadSurface("images/yellowbird-midflap.png");
const birdTextureMidflap = canvas.createTextureFromSurface(birdSurfaceMidflap);

const birdSurfaceUpflap = canvas.loadSurface("images/yellowbird-upflap.png");
const birdTextureUpflap = canvas.createTextureFromSurface(birdSurfaceUpflap);

const birdSurfaceDownflap = canvas.loadSurface(
  "images/yellowbird-downflap.png",
);
const birdTextureDownflap = canvas.createTextureFromSurface(
  birdSurfaceDownflap,
);

const startScreenSurface = canvas.loadSurface("images/start.png");
const startScreenTexture = canvas.createTextureFromSurface(startScreenSurface);

const BgScreenSurface = canvas.loadSurface("images/background.png");
const BgScreenTexture = canvas.createTextureFromSurface(BgScreenSurface);

const pipeSurfaceUp = canvas.loadSurface("images/pipe-up.png");
const pipeTextureUp = canvas.createTextureFromSurface(pipeSurfaceUp);

const pipeSurfaceDown = canvas.loadSurface("images/pipe-down.png");
const pipeTextureDown = canvas.createTextureFromSurface(pipeSurfaceDown);

const birdTextures = [
  birdTextureUpflap,
  birdTextureMidflap,
  birdTextureDownflap,
];
let animationCycle = 0; // 0, 1, 2

let prevTime = performance.now();

canvas.on("draw", () => {
  const currTime = performance.now();
  const deltaTime = currTime - prevTime;
  prevTime = currTime;
  if (intro) {
    canvas.clear();
    canvas.copy(startScreenTexture, { x: 0, y: 0, width: 800, height: 600 }, {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
    });
    canvas.renderFont(font, "Press Space", {
      blended: { color: { r: 209, g: 27, b: 20, a: 255 } },
    }, {
      x: Math.floor(x_font) + 300,
      y: Math.floor(y_font) + 470,
      width,
      height,
    });
    canvas.renderFont(font, "  to start ", {
      blended: { color: { r: 209, g: 27, b: 20, a: 255 } },
    }, {
      x: Math.floor(x_font) + 290,
      y: Math.floor(y_font) + 520,
      width,
      height,
    });

    canvas.present();
    return;
  }
  canvas.setDrawColor(255, 255, 90, 255);

  canvas.copy(BgScreenTexture, { x: 0, y: 0, width: 800, height: 600 }, {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  });

  canvas.setDrawColor(181, 14, 26, 255);
  for (let idx = 0; idx < upperPipes.length; idx++) {
    if (
      checkCollision(
        playerX,
        playerY,
        34,
        24,
        upperPipes[idx].x,
        UPPER_PIPE_Y,
        PIPE_WIDTH,
        upperPipes[idx].height,
      ) ||
      checkCollision(
        playerX,
        playerY,
        34,
        24,
        lowerPipes[idx].x,
        LOWER_PIPE_Y_BASE - lowerPipes[idx].height,
        PIPE_WIDTH,
        lowerPipes[idx].height,
      )
    ) {
      // Only runs once
      if (!gameOver) {
        gameOver = true;
        canvas.playMusic(
          "./audio/game_over.wav",
        );
        canvas.renderFont(font, "Game Over!", {
          blended: { color: { r: 209, g: 27, b: 20, a: 255 } },
        }, {
          x: Math.floor(x_font) + 64,
          y: Math.floor(y_font) + 64,
          width,
          height,
        });
        canvas.present();
      }
    }
    if (
      checkCollision(
        playerX + 50 / 2,
        playerY,
        0,
        50,
        upperPipes[idx].x + PIPE_WIDTH / 2,
        upperPipes[idx].height,
        0,
        800 - upperPipes[idx].height - lowerPipes[idx].height,
      )
    ) {
      score_value += 1;
      let score_effects = ["scored_1.wav", "scored_2.wav"];
      canvas.playMusic(
        "./audio/" + score_effects[Math.floor(Math.random() * 2)],
      );
    }

    // Debug:
    // canvas.fillRect(playerX + 50 / 2, playerY, 0, 50)
    // canvas.fillRect(upperPipes[idx].x + PIPE_WIDTH / 2, upperPipes[idx].height, 0, 800 - upperPipes[idx].height - lowerPipes[idx].height);

    // Pipes
    canvas.copy(pipeTextureDown, { x: 0, y: 0, width: 52, height: 320 }, {
      x: upperPipes[idx].x,
      y: UPPER_PIPE_Y,
      width: PIPE_WIDTH,
      height: upperPipes[idx].height,
    });
    canvas.copy(pipeTextureUp, { x: 0, y: 0, width: 52, height: 320 }, {
      x: lowerPipes[idx].x,
      y: LOWER_PIPE_Y_BASE - lowerPipes[idx].height,
      width: PIPE_WIDTH,
      height: lowerPipes[idx].height,
    });
    canvas.copy(birdTextures[animationCycle], {
      x: 0,
      y: 0,
      width: 34,
      height: 24,
    }, {
      x: playerX,
      y: playerY,
      width: 34,
      height: 24,
    });
    if (!gameOver) {
      // Wing animation
      animationCycle += 1;
      if (animationCycle >= 3) {
        animationCycle = 0;
      }

      upperPipes[idx].x -= 1;
      lowerPipes[idx].x -= 1;
      if (upperPipes[idx].x <= -PIPE_WIDTH) {
        upperPipes[idx].x = 800 + PIPE_WIDTH;
        upperPipes[idx].height = getRandomInt(100, 200);
        lowerPipes[idx].x = 800 + PIPE_WIDTH;
        lowerPipes[idx].height = 800 - upperPipes[idx].height - GAP;
      }

      if (playerY >= 600 - 50) {
        gameOver = true;

        canvas.playMusic(
          "./audio/game_over.wav",
        );
      }
    }
    canvas.renderFont(font, "Score: " + score_value, {
      blended: { color: { r: 127, g: 201, b: 201, a: 255 } },
    }, {
      x: Math.floor(x_font) + 550,
      y: Math.floor(y_font) + 550,
      width,
      height,
    });
    if (is_space) {
      playerY -= 2;
      setTimeout(() => is_space = false, 84);
    } else {
      // Give player gravity downwards
      playerY += gravity;
    }
    if (playerY >= 600 - 50) {
      playerY = 600 - 50;
    }
  }

  canvas.present();
});

canvas.on("event", (e) => {
  if (e.type == "quit") {
    canvas.quit();
  }
  if (e.type == "key_down") {
    // Space
    if (e.keycode == 32 && !gameOver) {
      intro = false;
      is_space = true;
    }
  }
});

await canvas.start();
