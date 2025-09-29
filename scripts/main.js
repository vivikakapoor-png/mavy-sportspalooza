// main.js - handles surprise confetti and small helpers
(function(){
  function qs(sel){return document.querySelector(sel)}
  // simple confetti-like squares using CSS-emulated method (fallback)
  function showConfetti(){
    for(let i=0;i<36;i++){
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = (Math.random()*100) + '%';
      el.style.background = ['#ff595e','#ffb545','#ffd166','#06d6a0','#118ab2'][Math.floor(Math.random()*5)];
      el.style.transform = 'translateY(0) rotate(' + (Math.random()*360) + 'deg)';
      document.body.appendChild(el);
      setTimeout(()=> el.remove(), 3000);
    }
  }

  const surprise = qs('#surpriseBtn');
  if(surprise){
    surprise.addEventListener('click', ()=>{
      showConfetti();
      surprise.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}], {duration:420});
    });
  }

  // inject minimal confetti styles (keeps each page self-contained)
  const style = document.createElement('style');
  style.textContent = `
    .confetti{position:fixed;top:6%;width:10px;height:16px;border-radius:2px;z-index:9999;opacity:0.95;animation:fall 2.8s linear}
    @keyframes fall{0%{transform:translateY(-10vh) rotate(0)}100%{transform:translateY(110vh) rotate(360deg); opacity:0.9}}
  `;
  document.head.appendChild(style);
})();
