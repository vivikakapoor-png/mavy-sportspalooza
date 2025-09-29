// NFL Logo Match-Up — Mavy style
// Expects assets/logos/*.png for the 32 teams (see filenames list).
// 15 random questions per round. Leaderboard stored in localStorage (mavy_logo_leaderboard)

const TEAM_FILES = [
  {slug:'arizona-cardinals', name:'Arizona Cardinals'},
  {slug:'atlanta-falcons', name:'Atlanta Falcons'},
  {slug:'baltimore-ravens', name:'Baltimore Ravens'},
  {slug:'buffalo-bills', name:'Buffalo Bills'},
  {slug:'carolina-panthers', name:'Carolina Panthers'},
  {slug:'chicago-bears', name:'Chicago Bears'},
  {slug:'cincinnati-bengals', name:'Cincinnati Bengals'},
  {slug:'cleveland-browns', name:'Cleveland Browns'},
  {slug:'dallas-cowboys', name:'Dallas Cowboys'},
  {slug:'denver-broncos', name:'Denver Broncos'},
  {slug:'detroit-lions', name:'Detroit Lions'},
  {slug:'green-bay-packers', name:'Green Bay Packers'},
  {slug:'houston-texans', name:'Houston Texans'},
  {slug:'indianapolis-colts', name:'Indianapolis Colts'},
  {slug:'jacksonville-jaguars', name:'Jacksonville Jaguars'},
  {slug:'kansas-city-chiefs', name:'Kansas City Chiefs'},
  {slug:'las-vegas-raiders', name:'Las Vegas Raiders'},
  {slug:'la-chargers', name:'Los Angeles Chargers'},
  {slug:'la-rams', name:'Los Angeles Rams'},
  {slug:'miami-dolphins', name:'Miami Dolphins'},
  {slug:'minnesota-vikings', name:'Minnesota Vikings'},
  {slug:'new-england-patriots', name:'New England Patriots'},
  {slug:'new-orleans-saints', name:'New Orleans Saints'},
  {slug:'new-york-giants', name:'New York Giants'},
  {slug:'new-york-jets', name:'New York Jets'},
  {slug:'philadelphia-eagles', name:'Philadelphia Eagles'},
  {slug:'pittsburgh-steelers', name:'Pittsburgh Steelers'},
  {slug:'san-francisco-49ers', name:'San Francisco 49ers'},
  {slug:'seattle-seahawks', name:'Seattle Seahawks'},
  {slug:'tampa-bay-buccaneers', name:'Tampa Bay Buccaneers'},
  {slug:'tennessee-titans', name:'Tennessee Titans'},
  {slug:'washington_commanders', name:'Washington Commanders'}
];

const QUESTIONS_PER_ROUND = 10;
const LOGO_PATH = 'assets/logos/'; // place your PNGs here

// UI elements
const startBtn = document.getElementById('startBtn');
const viewLeadersBtn = document.getElementById('viewLeaders');
const playerNameInput = document.getElementById('playerName');

const gameArea = document.getElementById('gameArea');
const qNumEl = document.getElementById('qNum');
const teamNameEl = document.getElementById('teamName');
const choicesEl = document.getElementById('choices');
const nextBtn = document.getElementById('nextBtn');
const quitBtn = document.getElementById('quitBtn');

const resultArea = document.getElementById('resultArea');
const resultText = document.getElementById('resultText');
const saveBtn = document.getElementById('saveBtn');
const againBtn = document.getElementById('againBtn');
const homeBtn = document.getElementById('homeBtn');

const leaderboard = document.getElementById('leaderboard');
const leadersOl = document.getElementById('leaders');
const clearBtn = document.getElementById('clearBtn');
const closeBtn = document.getElementById('closeBtn');

let pool = [];
let round = [];
let currentIndex = 0;
let correctCount = 0;
let lastSelection = null;

// localStorage key
const STORAGE_KEY = 'mavy_logo_leaderboard';

// Setup
function buildPool(){
  pool = TEAM_FILES.slice(); // copy
}

function pickRound(){
  // shuffle and take QUESTIONS_PER_ROUND
  const arr = pool.slice();
  shuffle(arr);
  round = arr.slice(0, QUESTIONS_PER_ROUND);
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// Start round
startBtn.addEventListener('click', ()=> {
  const name = (playerNameInput.value || 'Guest').trim();
  playerNameInput.value = name;
  startRound();
});

function startRound(){
  buildPool();
  pickRound();
  currentIndex = 0;
  correctCount = 0;
  gameArea.classList.remove('hidden');
  resultArea.classList.add('hidden');
  leaderboard.classList.add('hidden');
  startBtn.disabled = true;
  renderQuestion();
}

function renderQuestion(){
  const team = round[currentIndex];
  qNumEl.textContent = currentIndex + 1;
  teamNameEl.textContent = team.name;

  // build 4 choices: correct + 3 random others
  const choices = [team];
  // pick 3 distinct distractors
  const others = pool.filter(t => t.slug !== team.slug);
  shuffle(others);
  choices.push(others[0], others[1], others[2]);
  shuffle(choices);

  // render
  choicesEl.innerHTML = '';
  lastSelection = null;
  nextBtn.disabled = true;

  choices.forEach(c => {
    const div = document.createElement('div');
    div.className = 'choice';
    const img = document.createElement('img');
    img.src = LOGO_PATH + c.slug + '.png';
    img.alt = c.name;
    img.onerror = ()=> {
      // if missing logo, show friendly placeholder text
      img.style.display = 'none';
      const p = document.createElement('div');
      p.style.color = 'white';
      p.textContent = c.name;
      div.appendChild(p);
    };
    div.appendChild(img);

    div.addEventListener('click', ()=>{
      if(lastSelection) return; // already answered
      lastSelection = div;
      // check correct
      if(c.slug === team.slug){
        div.classList.add('correct');
        correctCount++;
      } else {
        div.classList.add('wrong');
        // highlight the real one
        // find correct choice element and mark it
        setTimeout(()=> {
          Array.from(choicesEl.children).forEach(ch => {
            const alt = ch.querySelector('img') && ch.querySelector('img').alt;
            if(alt === team.name) ch.classList.add('correct');
          });
        }, 120);
      }
      nextBtn.disabled = false;
    });

    choicesEl.appendChild(div);
  });
}

nextBtn.addEventListener('click', ()=>{
  if(currentIndex < round.length - 1){
    currentIndex++;
    renderQuestion();
  } else {
    endRound();
  }
});

quitBtn.addEventListener('click', ()=> {
  location.reload();
});

function endRound(){
  gameArea.classList.add('hidden');
  resultArea.classList.remove('hidden');
  resultText.textContent = `${playerNameInput.value || 'Guest'}, you scored ${correctCount} out of ${round.length}!`;
  startBtn.disabled = false;
}

saveBtn.addEventListener('click', ()=>{
  const name = playerNameInput.value.trim() || 'Guest';
  const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  list.push({name, score: correctCount, date: new Date().toISOString()});
  list.sort((a,b)=> b.score - a.score || new Date(a.date) - new Date(b.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  showLeaderboard();
});

againBtn.addEventListener('click', ()=> startRound());
homeBtn.addEventListener('click', ()=> { location.reload(); });

// Leaderboard UI
viewLeadersBtn.addEventListener('click', showLeaderboard);
closeBtn.addEventListener('click', ()=> {
  leaderboard.classList.add('hidden');
});
clearBtn.addEventListener('click', ()=> {
  if(confirm('Clear leaderboard?')){
    localStorage.removeItem(STORAGE_KEY);
    renderLeaders();
  }
});

function showLeaderboard(){
  renderLeaders();
  leaderboard.classList.remove('hidden');
  resultArea.classList.add('hidden');
  gameArea.classList.add('hidden');
  startBtn.disabled = false;
}

function renderLeaders(){
  const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  leadersOl.innerHTML = '';
  if(list.length === 0){
    const li = document.createElement('li');
    li.textContent = 'No scores yet — be the first!';
    leadersOl.appendChild(li);
    return;
  }
  list.forEach(s => {
    const li = document.createElement('li');
    const date = new Date(s.date);
    li.textContent = `${s.name} — ${s.score} / ${QUESTIONS_PER_ROUND} (${date.toLocaleDateString()})`;
    leadersOl.appendChild(li);
  });
}
