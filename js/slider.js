const slider = document.getElementById('slider');
const sliderWrapper = document.getElementById('sliderWrapper');
const slides = Array.from(sliderWrapper.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsEl = document.getElementById('indicators');

let currentIndex = 1;
let slideWidth = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;
let startTranslate = 0;
let currentTranslate = 0;
let totalSlides = slides.length - 2;

function buildIndicators() {
  indicatorsEl.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i + 1));
    indicatorsEl.appendChild(dot);
  }
}
buildIndicators();

function setActiveDot() {
  const dots = indicatorsEl.querySelectorAll('.dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex - 1));
}

function measure() {
  slideWidth = slider.getBoundingClientRect().width;
  setTranslate(-currentIndex * slideWidth, false);
}
window.addEventListener('resize', measure);
measure();

function setTranslate(x, withTransition = true) {
  sliderWrapper.style.transition = withTransition ? 'transform .45s ease-in-out' : 'none';
  sliderWrapper.style.transform = `translateX(${x}px)`;
  currentTranslate = x;
}

function goTo(index) {
  currentIndex = index;
  setTranslate(-currentIndex * slideWidth, true);
}

function next() {
  if (currentIndex < slides.length - 1) {
    goTo(currentIndex + 1);
  }
}
function prev() {
  if (currentIndex > 0) {
    goTo(currentIndex - 1);
  }
}

nextBtn.addEventListener('click', next);
prevBtn.addEventListener('click', prev);

sliderWrapper.addEventListener('transitionend', () => {
  if (currentIndex === 0) {
    currentIndex = totalSlides;
    setTranslate(-currentIndex * slideWidth, false);
  } else if (currentIndex === slides.length - 1) {
    currentIndex = 1;
    setTranslate(-currentIndex * slideWidth, false);
  }
  setActiveDot();
});

// 터치 이벤트와 포인터 이벤트 모두 지원
sliderWrapper.addEventListener('pointerdown', onPointerDown, { passive: true });
sliderWrapper.addEventListener('pointermove', onPointerMove, { passive: false });
sliderWrapper.addEventListener('pointerup', onPointerUp);
sliderWrapper.addEventListener('pointercancel', onPointerUp);
sliderWrapper.addEventListener('pointerleave', (e) => { if (isDragging) onPointerUp(e); });

// 터치 이벤트 추가 (모바일 지원)
sliderWrapper.addEventListener('touchstart', onTouchStart, { passive: true });
sliderWrapper.addEventListener('touchmove', onTouchMove, { passive: false });
sliderWrapper.addEventListener('touchend', onTouchEnd);

function onPointerDown(e) {
  isDragging = true;
  startX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  startTranslate = currentTranslate;
  sliderWrapper.style.transition = 'none';
  sliderWrapper.setPointerCapture?.(e.pointerId);
}

function onPointerMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  currentX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const delta = currentX - startX;
  setTranslate(startTranslate + delta, false);
}

function onPointerUp() {
  if (!isDragging) return;
  isDragging = false;
  const moved = currentTranslate - startTranslate;

  const threshold = Math.min(80, slideWidth * 0.12);
  if (moved < -threshold && currentIndex < slides.length - 1) {
    next();
  } else if (moved > threshold && currentIndex > 0) {
    prev();
  } else {
    setTranslate(-currentIndex * slideWidth, true);
  }
}

// 터치 이벤트 핸들러
function onTouchStart(e) {
  isDragging = true;
  startX = e.touches[0].clientX;
  startTranslate = currentTranslate;
  sliderWrapper.style.transition = 'none';
}

function onTouchMove(e) {
  if (!isDragging) return;
  e.preventDefault();
  currentX = e.touches[0].clientX;
  const delta = currentX - startX;
  setTranslate(startTranslate + delta, false);
}

function onTouchEnd() {
  if (!isDragging) return;
  isDragging = false;
  const moved = currentTranslate - startTranslate;

  const threshold = Math.min(80, slideWidth * 0.12);
  if (moved < -threshold && currentIndex < slides.length - 1) {
    next();
  } else if (moved > threshold && currentIndex > 0) {
    prev();
  } else {
    setTranslate(-currentIndex * slideWidth, true);
  }
}
