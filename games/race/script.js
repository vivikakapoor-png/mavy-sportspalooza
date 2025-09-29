// Race to the Finish — Mavy style
// Keys: Player1 = "a" | Player2 = "l". Mobile: use big TAP buttons.
// First to cross finish line wins. Small debounce to avoid accidental double counts.

const runner1 = document.getElementById('runner1');
const runner2 = document.getElementById('runner2');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const tapLeft = document.getElementById('tapLeft');
const tapRight = document.getElementById('tapRight');
const p1score = document.getElementById('p1score');
const p2score = document.getElementById('p2score');
const result = document.getElementById('result');
const trackWrap = document.querySelector('.track-wrap');
const finishEl = document.querySelector('.finish');

let running = false;
let winLock = false;
let p1 = {pos: 8, score: 0};     // left px
let p2 = {pos: 8, score: 0};
const STEP = 12;                 // px per press
const FINISH_OFFSET = 26;        // how close to finish element counts as win

// measure finish X coordinate relative to track-wrap
function finishX(){
  const rect = trackWrap.getBoundingClientRect();
  const f = finishEl.getBoundingClientRect();
  // return x relative to track-wrap left
  return f.left - rect.left;
}

function reset(){
  running = false;
  winLock = false;
  p1.pos = 8;
  p2.pos = 8;
  p1score.textContent = p1.score;
  p2score.textContent = p2.score;
  result.classList.add('hidden');
  runner1.style.left = p1.pos + 'px';
  runner2.style.left = p2.pos + 'px';
  restartBtn.disabled = true;
  startBtn.disabled = false;
}

function startRace(){
  reset();
  running = true;
  startBtn.disabled = true;
  restartBtn.disabled = false;
  result.classList.add('hidden');
}

function declareWinner(who){
  if(winLock) return;
  winLock = true;
  running = false;
  result.textContent = `${who} WINS! 🎉`;
  result.classList.remove('hidden');

  // increment winner score and save localStorage
  if(who === 'Player 1'){
    p1.score++;
    p1score.textContent = p1.score;
    localStorage.setItem('mavy_race_p1', p1.score);
  } else {
    p2.score++;
    p2score.textContent = p2.score;
    localStorage.setItem('mavy_race_p2', p2.score);
  }
  startBtn.disabled = false;
}

// keyboard controls
window.addEventListener('keydown', (e)=>{
  if(!running) return;
  const key = e.key.toLowerCase();
  if(key === 'a'){
    movePlayer(1);
  } else if(key === 'l'){
    movePlayer(2);
  }
});

// mobile tap buttons
tapLeft.addEventListener('touchstart', (e)=>{ e.preventDefault(); if(running) movePlayer(1); }, {passive:false});
tapRight.addEventListener('touchstart', (e)=>{ e.preventDefault(); if(running) movePlayer(2); }, {passive:false});
tapLeft.addEventListener('mousedown', ()=>{ if(running) movePlayer(1); });
tapRight.addEventListener('mousedown', ()=>{ if(running) movePlayer(2); });

function movePlayer(n){
  if(winLock) return;
  const fx = finishX() - FINISH_OFFSET;
  if(n === 1){
    p1.pos += STEP;
    runner1.style.left = p1.pos + 'px';
    if(p1.pos + runner1.offsetWidth >= fx){
      declareWinner('Player 1');
    }
  } else {
    p2.pos += STEP;
    runner2.style.left = p2.pos + 'px';
    if(p2.pos + runner2.offsetWidth >= fx){
      declareWinner('Player 2');
    }
  }
}

// wire UI
startBtn.addEventListener('click', startRace);
restartBtn.addEventListener('click', reset);

// load saved scores
(function loadScores(){
  const s1 = parseInt(localStorage.getItem('mavy_race_p1')||'0',10);
  const s2 = parseInt(localStorage.getItem('mavy_race_p2')||'0',10);
  p1.score = s1; p2.score = s2;
  p1score.textContent = p1.score;
  p2score.textContent = p2.score;
})();

// initialize positions
reset();
