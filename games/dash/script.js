// Dodgeball Dash
// Controls: left/right arrows OR drag on canvas (touch friendly)
// Keeps score, lives, and highscore in localStorage

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Logical (game) size (will scale to CSS)
const GAME_W = 980;
const GAME_H = 540;

// Elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highEl = document.getElementById('highscore');
const overlay = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const playAgain = document.getElementById('playAgain');
const goHome = document.getElementById('goHome');

// state
let scale = 1;
let player = { x: GAME_W / 2, y: GAME_H - 70, w: 120, h: 26, speed: 8 };
let balls = [];
let spawnTimer = 0;
let spawnInterval = 1000; // ms
let lastTime = 0;
let running = false;
let paused = false;
let score = 0;
let lives = 3;
let highscore = parseInt(localStorage.getItem('mavy_dodge_high') || '0', 10);

// difficulty metrics
let gameTime = 0;
let fallSpeedBase = 2; // base speed of balls

// adapt canvas size to CSS size
function resizeCanvas(){
  // Use CSS width to scale
  const cssWidth = canvas.clientWidth;
  scale = cssWidth / GAME_W;
  canvas.width = GAME_W;
  canvas.height = GAME_H;
  // scale context drawing when rendering (we'll draw with game coords and scale via CSS)
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// show high score
highEl.textContent = highscore;

// helpers
function rand(min,max){ return Math.random()*(max-min)+min; }

function startGame(){
  score = 0;
  lives = 3;
  gameTime = 0;
  spawnInterval = 1000;
  fallSpeedBase = 2;
  balls = [];
  player.x = GAME_W/2;
  running = true;
  paused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  overlay.classList.add('hidden');
  lastTime = performance.now();
  requestAnimationFrame(loop);
  updateHUD();
}

function pauseGame(){
  paused = !paused;
  pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if(!paused){
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }
}

function endGame(){
  running = false;
  overlay.classList.remove('hidden');
  finalScore.textContent = `You scored ${score}`;
  if(score > highscore){
    highscore = score;
    localStorage.setItem('mavy_dodge_high', String(highscore));
    highEl.textContent = highscore;
  }
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function restartGame(){
  startGame();
}

function updateHUD(){
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  highEl.textContent = highscore;
}

// spawn a ball
function spawnBall(){
  const size = rand(28,56);
  const x = rand(size, GAME_W - size);
  const speed = fallSpeedBase + rand(0,2) + gameTime*0.0010; // increase with time
  const color = ['#ff6b6b','#ffd166','#4dd0e1','#ffd166','#ffd166'][Math.floor(rand(0,5))];
  balls.push({ x, y:-size, r: size/2, vy: speed, color });
}

// collision check
function rectCircleCollide(rx, ry, rw, rh, cx, cy, cr){
  // find closest point
  const closestX = Math.max(rx, Math.min(cx, rx+rw));
  const closestY = Math.max(ry, Math.min(cy, ry+rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx*dx + dy*dy) < (cr*cr);
}

// input handling
let leftPressed=false, rightPressed=false;
window.addEventListener('keydown', e=>{
  if(e.code === 'ArrowLeft') leftPressed=true;
  if(e.code === 'ArrowRight') rightPressed=true;
});
window.addEventListener('keyup', e=>{
  if(e.code === 'ArrowLeft') leftPressed=false;
  if(e.code === 'ArrowRight') rightPressed=false;
});

// touch / drag support
let dragging = false;
let dragOffsetX = 0;
canvas.addEventListener('pointerdown', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) / (rect.width / GAME_W); // convert to game coords
  // if pointer is near player, start drag
  if(Math.abs(px - player.x) < player.w){
    dragging = true;
    dragOffsetX = px - player.x;
  } else {
    // tap left/right to move a bit
    if(px < GAME_W/2) player.x -= 80;
    else player.x += 80;
  }
  e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e)=>{
  if(!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) / (rect.width / GAME_W);
  player.x = Math.max(player.w/2, Math.min(GAME_W - player.w/2, px - dragOffsetX));
});
canvas.addEventListener('pointerup', (e)=>{
  dragging=false;
});

// main loop
function loop(now){
  if(!running || paused) return;
  const dt = Math.min(40, now - lastTime); // cap for stability in ms
  lastTime = now;
  gameTime += dt;
  // spawn logic
  spawnTimer += dt;
  // gradually decrease spawn interval but not too low
  if(spawnInterval > 350 && Math.floor(gameTime/5000) > 0){
    spawnInterval = Math.max(350, 1000 - Math.floor(gameTime/5000) * 60);
  }
  if(spawnTimer > spawnInterval){
    spawnTimer = 0;
    spawnBall();
  }

  // update player by keyboard
  if(!dragging){
    if(leftPressed) player.x -= player.speed * (dt/16);
    if(rightPressed) player.x += player.speed * (dt/16);
  }
  // clamp
  player.x = Math.max(player.w/2, Math.min(GAME_W - player.w/2, player.x));

  // update balls
  for(let i=balls.length-1;i>=0;i--){
    const b = balls[i];
    b.y += b.vy * (dt/16); // scale with dt
    // collision with player
    const px = player.x - player.w/2;
    const py = player.y - player.h/2;
    if(rectCircleCollide(px, py, player.w, player.h, b.x, b.y, b.r)){
      // hit - remove ball, lose life
      balls.splice(i,1);
      lives--;
      // small score penalty
      score = Math.max(0, score - 2);
      updateHUD();
      if(lives <= 0){
        endGame();
        return;
      }
      continue;
    }
    // if ball reached bottom (missed) - score points
    if(b.y - b.r > GAME_H){
      balls.splice(i,1);
      score++;
      updateHUD();
      continue;
    }
  }

  // gradually increase fall speed base slightly with time
  fallSpeedBase += dt * 0.0002;

  // render
  render();

  // next tick
  requestAnimationFrame(loop);
}

function render(){
  // Clear (we draw in game coords; canvas is fixed pixels but CSS scales to fit visually)
  ctx.clearRect(0,0,GAME_W,GAME_H);

  // Draw sky/stands suggestion (subtle)
  ctx.fillStyle = '#9ee3ff';
  ctx.fillRect(0,0,GAME_W, GAME_H * 0.5);

  // draw banner/bleachers silhouette (simple shapes so the game stays lightweight)
  ctx.fillStyle = '#0b3a63';
  ctx.fillRect(0, GAME_H*0.1, GAME_W*0.45, GAME_H*0.12);
  ctx.fillRect(GAME_W*0.55, GAME_H*0.1, GAME_W*0.45, GAME_H*0.12);

  // draw confetti background (subtle)
  for(let i=0;i<6;i++){
    const cx = (i*157 + (gameTime*0.03)%GAME_W)%GAME_W;
    ctx.fillStyle = i%2? '#ffd166' : '#ff6b6b';
    ctx.fillRect(cx, 40 + (i*9)%60, 8, 12);
  }

  // draw grass (playing area)
  ctx.fillStyle = '#4aa24a';
  ctx.fillRect(0, GAME_H - 120, GAME_W, 120);
  // slight field arc
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillRect(0, GAME_H - 140, GAME_W, 6);

// draw player as an image
const playerImg = render.playerImg || (() => {
    const img = new Image();
    img.src = "../../assets/mariners_cartoon.png"; // Make sure this path is correct and the image exists
    render.playerImg = img;
    return img;
})();
const px = Math.round(player.x);
const py = player.y;
const imgW = player.w;
const imgH = player.h * 4; // Adjust height as needed for your image proportions
if (playerImg.complete) {
    ctx.drawImage(playerImg, px - imgW / 2, py - imgH / 2, imgW, imgH);
} else {
    // fallback: draw a placeholder until image loads
    ctx.fillStyle = '#07203a';
    ctx.fillRect(px - player.w / 2, py - player.h / 2, player.w, player.h);
}

  // draw balls
  for(const b of balls){
    // shadow
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.ellipse(b.x+6, b.y+6, b.r*0.9, b.r*0.5, 0, 0, Math.PI*2);
    ctx.fill();

    // body
    ctx.beginPath();
    ctx.fillStyle = b.color;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();

    // seams / lines
    ctx.strokeStyle = '#073049';
    ctx.lineWidth = Math.max(2, Math.round(b.r*0.14));
    ctx.beginPath();
    ctx.moveTo(b.x - b.r*0.5, b.y - b.r*0.6);
    ctx.lineTo(b.x + b.r*0.5, b.y + b.r*0.6);
    ctx.stroke();
  }
}

// utility: rounded rect drawing
function roundRect(ctx, x, y, w, h, r, fill, stroke){
  if(typeof stroke === 'undefined'){ stroke = true; }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if(fill) ctx.fill();
  if(stroke) ctx.stroke();
}

// wire UI
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
playAgain.addEventListener('click', ()=>{ overlay.classList.add('hidden'); startGame(); });
goHome.addEventListener('click', ()=>{ location.href = 'index.html'; });

// to ensure canvas visuals scale on high-DPI screens, we can apply CSS scaling by leaving canvas logical size and using CSS width.
// (We already set canvas.width/height to GAME_W/GAME_H, and CSS controls visual size — in this setup the canvas is responsive by CSS in style.css)

updateHUD();
