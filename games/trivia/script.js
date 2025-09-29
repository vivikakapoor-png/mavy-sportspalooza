// Trivia app
let QUESTIONS=[];
const TOTAL_QUESTIONS=15;
let quiz=[]; let pool=[]; let indexQ=0; let score=0; let selected=null; let playerName='';

async function loadQ(){ QUESTIONS = await fetch('questions.json').then(r=>r.json()); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

function start(){
  const cat = document.getElementById('category').value;
  playerName = document.getElementById('playerName').value.trim() || 'Guest';
  pool = (cat==='All')? QUESTIONS.slice() : QUESTIONS.filter(q=>q.category===cat);
  pool = shuffle(pool);
  quiz = pool.slice(0, TOTAL_QUESTIONS);
  indexQ=0; score=0; selected=null;
  document.getElementById('startBtn').disabled=true;
  document.getElementById('quizArea').classList.remove('hidden');
  document.getElementById('resultArea').classList.add('hidden');
  show();
  updateProg();
}

function show(){
  const q = quiz[indexQ];
  document.getElementById('questionText').textContent = q.question;
  const choices = document.getElementById('choices'); choices.innerHTML='';
  q.choices.forEach(c=>{
    const btn = document.createElement('button'); btn.className='choice-btn'; btn.textContent=c;
    btn.addEventListener('click', ()=>{ document.querySelectorAll('.choice-btn').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); selected={text:c, ans:q.answer}; document.getElementById('nextBtn').disabled=false; });
    choices.appendChild(btn);
  });
  document.getElementById('nextBtn').disabled=true;
}

function nextQ(){
  if(!selected) return;
  if(selected.text === selected.ans) score++;
  indexQ++;
  if(indexQ>=quiz.length) finish(); else { show(); updateProg(); selected=null; }
}

function finish(){
  document.getElementById('quizArea').classList.add('hidden');
  document.getElementById('resultArea').classList.remove('hidden');
  document.getElementById('scoreText').textContent = `${playerName}, you scored ${score} out of ${quiz.length}!`;
  document.getElementById('startBtn').disabled=false;
}

function saveScore(){
  const list = JSON.parse(localStorage.getItem('mavy_leaderboard')||'[]');
  list.push({name:playerName, score:score, date:new Date().toISOString()});
  list.sort((a,b)=>b.score - a.score || (new Date(b.date)-new Date(a.date)));
  localStorage.setItem('mavy_leaderboard', JSON.stringify(list.slice(0,20)));
  showBoard();
}

function showBoard(){
  document.getElementById('leaderboardArea').classList.remove('hidden');
  document.getElementById('resultArea').classList.add('hidden');
  document.getElementById('quizArea').classList.add('hidden');
  const list = JSON.parse(localStorage.getItem('mavy_leaderboard')||'[]'); const ol=document.getElementById('leaders'); ol.innerHTML='';
  list.forEach(l=>{ const li=document.createElement('li'); const d=new Date(l.date); li.textContent = `${l.name} — ${l.score} (${d.toLocaleDateString()})`; ol.appendChild(li); });
}

function clearBoard(){ if(confirm('Clear leaderboard?')){ localStorage.removeItem('mavy_leaderboard'); showBoard(); } }

function updateProg(){ document.getElementById('currentNum').textContent = indexQ+1; }

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadQ();
  document.getElementById('startBtn').addEventListener('click', start);
  document.getElementById('nextBtn').addEventListener('click', nextQ);
  document.getElementById('quitBtn').addEventListener('click', ()=>location.reload());
  document.getElementById('playAgain').addEventListener('click', ()=>start());
  document.getElementById('saveScore').addEventListener('click', saveScore);
  document.getElementById('viewLeaderboard').addEventListener('click', showBoard);
  document.getElementById('closeBoard').addEventListener('click', ()=>document.getElementById('leaderboardArea').classList.add('hidden'));
  document.getElementById('clearBoard').addEventListener('click', clearBoard);
});
