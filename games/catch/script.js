const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let basket = { x: 250, y: 360, width: 150, height: 20, speed: 10 };
let balls = [];
let score = 0;
let lives = 3;
let gameOver = false;

const baseballImg = new Image();
baseballImg.src = "../../assets/basketball.png";

// Controls
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") basket.x -= basket.speed;
  if (e.key === "ArrowRight") basket.x += basket.speed;
});

// Restart button
const restartBtn = document.getElementById("restartBtn");
restartBtn.addEventListener("click", () => {
  score = 0;
  lives = 3;
  balls = [];
  gameOver = false;
  restartBtn.classList.add("hidden");
  requestAnimationFrame(gameLoop);
});

function drawBasket() {
  ctx.fillStyle = "#ffcc00";
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
}

function drawBall(ball) {
  ctx.drawImage(
    baseballImg,
    ball.x - ball.radius,
    ball.y - ball.radius,
    ball.radius * 2,
    ball.radius * 2
  );
}

function spawnBall() {
  const x = Math.random() * (canvas.width - 20) + 10;
  balls.push({ x: x, y: 0, radius: 15, speed: 3 + Math.random() * 2 });
}

function update() {
  if (gameOver) return;

  for (let i = balls.length - 1; i >= 0; i--) {
    balls[i].y += balls[i].speed;

    // Catch
    if (
      balls[i].y + balls[i].radius >= basket.y &&
      balls[i].x > basket.x &&
      balls[i].x < basket.x + basket.width
    ) {
      score++;
      balls.splice(i, 1);
      continue;
    }

    // Miss
    if (balls[i].y > canvas.height) {
      lives--;
      balls.splice(i, 1);
      if (lives <= 0) {
        gameOver = true;
        restartBtn.classList.remove("hidden");
      }
    }
  }

  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;

  if (basket.x < 0) basket.x = 0;
  if (basket.x + basket.width > canvas.width) basket.x = canvas.width - basket.width;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBasket();
  balls.forEach(drawBall);

  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", 220, 180);
    ctx.fillText("Score: " + score, 240, 220);
  }
}

let frame = 0;
function gameLoop() {
  update();
  draw();

  frame++;
  if (frame % 60 === 0) spawnBall();

  if (!gameOver) requestAnimationFrame(gameLoop);
}

// ✅ Start game only after baseball.png is loaded
baseballImg.onload = () => {
  requestAnimationFrame(gameLoop);
};
