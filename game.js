const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_SIZE = 600;
const GRID_SIZE = 20;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const WIN_LENGTH = 15;
const INITIAL_SPEED = 150;

let gameOver = false;
let win = false;
let score = 0;
let highScore = 0;
let gameStarted = false;
let speed = INITIAL_SPEED;
let direction = "right";

let caterpillar = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
let food = { x: 15, y: 10 };

const overlay = document.getElementById("gameOverlay");
const video = document.getElementById("gameVideo");
const gameMessage = document.getElementById("gameMessage");
const restartButton = document.getElementById("restartButton");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");

function resetGame() {
  caterpillar = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  food = { x: 15, y: 10 };
  direction = "right";
  speed = INITIAL_SPEED;
  score = 0;
  gameOver = false;
  win = false;
  gameStarted = false;

  // Reset overlay and video
  video.pause();
  video.currentTime = 0;
  video.classList.add("hidden");
  overlay.classList.add("hidden");

  updateScore();
  draw();
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
  highScoreDisplay.textContent = `High Score: ${highScore}`;
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (!gameStarted) {
    ctx.fillStyle = "#000000";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press any key to start", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    return;
  }

  // Draw caterpillar
  ctx.fillStyle = "#32CD32";
  caterpillar.forEach((segment, index) => {
    ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    if (index === 0) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(segment.x * CELL_SIZE + 4, segment.y * CELL_SIZE + 4, 4, 4);
    }
  });

  // Draw food
  ctx.fillStyle = "#FF0066";
  ctx.beginPath();
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 3,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

function move() {
  if (gameOver || win) return;

  const head = { ...caterpillar[0] };
  switch (direction) {
    case "up":
      head.y -= 1;
      break;
    case "down":
      head.y += 1;
      break;
    case "left":
      head.x -= 1;
      break;
    case "right":
      head.x += 1;
      break;
  }

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= GRID_SIZE ||
    head.y >= GRID_SIZE ||
    caterpillar.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    endGame(false);
    return;
  }

  caterpillar.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    if (caterpillar.length >= WIN_LENGTH) {
      endGame(true);
      return;
    }
    placeNewFood();
    speed = Math.max(speed * 0.95, 50);
  } else {
    caterpillar.pop();
  }

  updateScore();
  draw();

  setTimeout(move, speed);
}

function placeNewFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (caterpillar.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
  food = newFood;
}

function endGame(winStatus) {
  gameOver = !winStatus;
  win = winStatus;
  highScore = Math.max(highScore, score);

  video.src = win ? "public.win.mp4" : "public.lose.mp4";
  video.classList.remove("hidden");
  video.play();

  gameMessage.textContent = win ? "You Win!" : "Game Over!";
  overlay.classList.remove("hidden");
}

window.addEventListener("keydown", (e) => {
  if (!gameStarted) {
    gameStarted = true;
    move();
    return;
  }

  switch (e.key.toLowerCase()) {
    case "arrowup":
    case "w":
      if (direction !== "down") direction = "up";
      break;
    case "arrowdown":
    case "s":
      if (direction !== "up") direction = "down";
      break;
    case "arrowleft":
    case "a":
      if (direction !== "right") direction = "left";
      break;
    case "arrowright":
    case "d":
      if (direction !== "left") direction = "right";
      break;
  }
});

restartButton.addEventListener("click", resetGame);

// Initial Draw
draw();
