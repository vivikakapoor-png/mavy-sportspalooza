// confetti: lightweight canvas-based confetti
(function(){
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', ()=>{ W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

  const colors = ['#ff595e','#ffb545','#ffd166','#06d6a0','#118ab2','#06a3ff','#a44dd4'];
  let particles = [];

  function rand(min,max){ return Math.random()*(max-min)+min; }
  function createParticle(x,y){
    return {
      x: x != null ? x : rand(0,W),
      y: y != null ? y : rand(-20, H/2),
      vx: rand(-3,3),
      vy: rand(1,6),
      size: Math.round(rand(6,12)),
      color: colors[Math.floor(rand(0,colors.length))],
      rot: rand(0, Math.PI*2),
      rotSpeed: rand(-0.15,0.15),
      ttl: rand(60,140)
    };
  }

  function spawn(n,x,y){
    for(let i=0;i<n;i++) particles.push(createParticle(x,y));
  }

  function updateAndDraw(){
    ctx.clearRect(0,0,W,H);
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.rot += p.rotSpeed;
      p.ttl--;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
      if(p.y > H + 20 || p.ttl <= 0) particles.splice(i,1);
    }
    requestAnimationFrame(updateAndDraw);
  }
  updateAndDraw();

  // small blast for page load and for "Surprise!"
  function blast(){
    spawn(140, W/2, H/3);
  }
  window.addEventListener('load', ()=>{ setTimeout(blast, 700); });

  // hook up surprise button
  const surpriseBtn = document.getElementById('surpriseBtn');
  if(surpriseBtn){
    surpriseBtn.addEventListener('click', ()=>{
      blast();
      surpriseBtn.setAttribute('aria-pressed','true');
      surpriseBtn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:480});
    });
  }

  // small convenience: trigger confetti when Enter pressed on page
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ spawn(60, rand(0,W), rand(0,H/2)); } });
})();
