(function(){
  const track = document.getElementById('track');
  const slides = Array.from(track.children);
  const total = slides.length;
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const viewport = document.getElementById('viewport');
  const indicatorsEl = document.getElementById('indicators');

  let index = 0; // 현재 인덱스

  // 인디케이터 생성
  function buildIndicators() {
    indicatorsEl.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i === index ? ' active' : '');
      dot.addEventListener('click', () => { 
        pauseAutoplay(); 
        go(i); 
        resumeAutoplaySoon(); 
      });
      indicatorsEl.appendChild(dot);
    }
  }
  buildIndicators();

  function updateIndicators() {
    const dots = indicatorsEl.querySelectorAll('.dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  // 스냅 이동 (항상 한 장 단위)
  function snapTo(i, animate=true){
    track.style.transition = animate ? 'transform .36s ease' : 'none';
    track.style.transform = `translateX(${-i*100}%)`;
  }

  function normalize(i){ return (i % total + total) % total; }
  function go(i){ 
    index = normalize(i); 
    snapTo(index, true);
    updateIndicators();
  }
  function next(){ go(index + 1); }
  function prev(){ go(index - 1); }

  // 버튼
  prevBtn.addEventListener('click', () => { pauseAutoplay(); prev(); resumeAutoplaySoon(); });
  nextBtn.addEventListener('click', () => { pauseAutoplay(); next(); resumeAutoplaySoon(); });

  // 터치 스와이프
  let dragging=false, startX=0, curX=0, t0=0;
  const THRESH=40; // px
  
  function onStart(x){ 
    dragging=true; 
    startX=curX=x; 
    t0=Date.now(); 
    track.style.transition='none';
    pauseAutoplay();
  }
  
  function onMove(x){ 
    if(!dragging) return; 
    curX=x; 
    const w=viewport.getBoundingClientRect().width; 
    const dx=curX-startX; 
    const base=-index*100; 
    let percent=(dx/w)*100;
    // 시각적 저항감
    if ((index===0 && percent>0) || (index===total-1 && percent<0)) percent*=0.35;
    track.style.transform = `translateX(${base+percent}%)`;
  }
  
  function onEnd(){ 
    if(!dragging) return; 
    dragging=false; 
    const dx=curX-startX; 
    const fast = Math.abs(dx)>10 && (Date.now()-t0)<180; 
    if (dx<=-THRESH || (fast && dx<0)) next(); 
    else if (dx>=THRESH || (fast && dx>0)) prev(); 
    else snapTo(index,true);
    resumeAutoplaySoon();
  }

  viewport.addEventListener('touchstart', e=>onStart(e.touches[0].clientX), {passive:true});
  viewport.addEventListener('touchmove', e=>onMove(e.touches[0].clientX), {passive:true});
  viewport.addEventListener('touchend', onEnd);
  viewport.addEventListener('touchcancel', onEnd);

  // 리사이즈 시 중간 걸침 방지
  window.addEventListener('resize', ()=>snapTo(index,false));

  // 오토플레이(2초, 무한 순환)
  const INTERVAL=2000; 
  let timer=null, resumeTimer=null;
  
  function tick(){ next(); }
  function startAutoplay(){ stopAutoplay(); timer=setInterval(tick, INTERVAL); }
  function stopAutoplay(){ clearInterval(timer); timer=null; }
  function pauseAutoplay(){ stopAutoplay(); clearTimeout(resumeTimer); }
  function resumeAutoplaySoon(){ clearTimeout(resumeTimer); resumeTimer=setTimeout(startAutoplay, 1200); }

  // 초기 렌더
  snapTo(index,false);
  startAutoplay();
})();
