import { Canvas } from "https://deno.land/x/sdl2/src/canvas.ts"

const canvas = new Canvas({
  title: "deno_sdl2_flappy_bird 🐦",
  height: 800,
  width: 600,
  centered: true,
  fullscreen: false,
  hidden: false,
  resizable: true,
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
  "font.ttf",
  128,
  { style: "normal" },
);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let playerX = 370;
let playerY = 100;
let is_space = false;

const upperPipes = [];
const lowerPipes = [];

const UPPER_PIPE_Y = 0;
const LOWER_PIPE_Y_BASE = 800;
const PIPE_WIDTH = 100;
const PIPE_DISTANCE = 250;
const GAP = 180;

let x_font = 0, y_font = 0
let gameOver = false;
upperPipes.push({ x: 800 + PIPE_WIDTH, height: getRandomInt(100, 200) })
upperPipes.push({ x: 800 + (PIPE_WIDTH * 2) + PIPE_DISTANCE, height: getRandomInt(100, 200) })

// Screen width - Corresponding upper pipe height - Random Gap
lowerPipes.push({ x: 800 + PIPE_WIDTH, height: 800 - upperPipes[0].height - GAP  });
lowerPipes.push({ x: 800 + (PIPE_WIDTH * 2) + PIPE_DISTANCE, height: 800 - upperPipes[1].height - GAP });

canvas.on("draw", () => {
	if(gameOver) {
		return;
	}
	canvas.setDrawColor(0, 0, 0, 255);
	canvas.clear();
	canvas.setDrawColor(87, 7, 90, 255);
	canvas.fillRect(playerX, playerY, 50, 50);
	canvas.setDrawColor(181, 14, 26, 255);
	for (let idx = 0; idx < upperPipes.length; idx++) {
	    const width = Math.round(770 / 20) * 5;
		const height = Math.round(169 / 20) * 5;
		if(checkCollision(playerX, playerY, 50, 50, upperPipes[idx].x, UPPER_PIPE_Y, PIPE_WIDTH, upperPipes[idx].height) || checkCollision(playerX, playerY, 50, 50, lowerPipes[idx].x, LOWER_PIPE_Y_BASE - lowerPipes[idx].height, PIPE_WIDTH, lowerPipes[idx].height)) {
			// TODO: Hit
			gameOver = true;
			canvas.renderFont(font, "Game Over!", {
      			blended: { color: { r: 209, g: 27, b: 20, a: 255 } },
    		}, {
		      x: Math.floor(x_font) + 64,
		      y: Math.floor(y_font) + 64,
		      width,
		      height,
		    });
		}
		canvas.fillRect(upperPipes[idx].x, UPPER_PIPE_Y, PIPE_WIDTH, upperPipes[idx].height);
		canvas.fillRect(lowerPipes[idx].x, LOWER_PIPE_Y_BASE - lowerPipes[idx].height, PIPE_WIDTH, lowerPipes[idx].height);
		upperPipes[idx].x -= 1;
		lowerPipes[idx].x -= 1;
		if(upperPipes[idx].x <= -PIPE_WIDTH) {
			upperPipes[idx].x = 800 + PIPE_WIDTH;
			upperPipes[idx].height = getRandomInt(100, 200);
			lowerPipes[idx].x = 800 + PIPE_WIDTH;
			lowerPipes[idx].height = 800 - upperPipes[idx].height - GAP
		}
	}
	if(is_space) {
		playerY -= 5;
		setTimeout(() => is_space = false, 80)
	} else {
		// Give player gravity downwards
		playerY += gravity;
	}
	if(playerY >= 600 - 50) {
		playerY = 600 - 50;
	}

    canvas.present();
});

canvas.on("event", (e) => {
	if(e.type == "quit") {
		canvas.quit();
	}
	if(e.type == "key_down") {
		// Left arrow
		if(e.keycode == 1073741903) {
			playerX += 10;
		}
		// Space
		if(e.keycode == 32) {
			is_space = true;
		}
	}

});

await canvas.start();