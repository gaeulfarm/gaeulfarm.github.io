/**************************
 * 슬라이더 (모바일 드래그 고침)
 **************************/
const slider = document.getElementById('slider');
const sliderWrapper = document.getElementById('sliderWrapper');
const slides = Array.from(sliderWrapper.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsEl = document.getElementById('indicators');

let currentIndex = 1;                // [클론 포함] 시작 인덱스
let slideWidth = 0;                  // px 기준
let isDragging = false;
let startX = 0;
let currentX = 0;
let startTranslate = 0;
let currentTranslate = 0;
let animId = 0;
let totalSlides = slides.length - 2; // 클론 제외 실제 개수

// 인디케이터 동적 생성
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
  // 현재 인덱스 기준으로 px 이동
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
  // 무한 루프 보정
  if (currentIndex === 0) {
    currentIndex = totalSlides;
    setTranslate(-currentIndex * slideWidth, false);
  } else if (currentIndex === slides.length - 1) {
    currentIndex = 1;
    setTranslate(-currentIndex * slideWidth, false);
  }
  setActiveDot();
});

// 드래그/스와이프
sliderWrapper.addEventListener('pointerdown', onPointerDown, { passive: true });
sliderWrapper.addEventListener('pointermove', onPointerMove, { passive: false });
sliderWrapper.addEventListener('pointerup', onPointerUp);
sliderWrapper.addEventListener('pointercancel', onPointerUp);
sliderWrapper.addEventListener('pointerleave', (e) => { if(isDragging) onPointerUp(e); });

function onPointerDown(e) {
  isDragging = true;
  startX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  startTranslate = currentTranslate;
  sliderWrapper.style.transition = 'none';
  sliderWrapper.setPointerCapture?.(e.pointerId);
}

function onPointerMove(e) {
  if (!isDragging) return;
  // 가로 스와이프—세로 스크롤 방지
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

/**************************
 * 주소검색(다음 우편번호)
 **************************/
function sample6_execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = '';
      let extraAddr = '';
      if (data.userSelectedType === 'R') addr = data.roadAddress;
      else addr = data.jibunAddress;

      if (data.userSelectedType === 'R') {
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddr += (extraAddr !== '' ? ', ' : '') + data.buildingName;
        }
        if (extraAddr !== '') addr += ' (' + extraAddr + ')';
      }

      document.getElementById('sample6_postcode').value = data.zonecode;
      document.getElementById('sample6_address').value = addr;
      document.getElementById('sample6_detailAddress').focus();
    }
  }).open();
}
document.getElementById('addrBtn').addEventListener('click', sample6_execDaumPostcode);

/**************************
 * 구매하기 버튼 → 폼 열기
 **************************/
const buyBanner = document.getElementById('buyBanner');
const buyBtn = document.getElementById('buyBtn');
const reservationForm = document.getElementById('reservation-form');

buyBtn.addEventListener('click', () => {
  buyBanner.style.display = 'none';
  reservationForm.style.display = 'block';
  document.body.classList.add('form-open');
  setTimeout(() => {
    reservationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
});

/**************************
 * 주문 아이템 및 합계
 **************************/
const itemPrices = { "2kg": 25000, "4kg": 45000 };
const selectedItemsEl = document.getElementById('selected-items');
const addBtn = document.getElementById('addBtn');

addBtn.addEventListener('click', addItem);

function addItem() {
  const select = document.getElementById('product-select');
  const product = select.value;
  const productName = select.options[select.selectedIndex].text;

  const wrap = document.createElement('div');
  wrap.className = 'item';
  wrap.innerHTML = `
    <div class="item-info">
      <span class="item-name">${productName}</span>
      <span class="item-price">${itemPrices[product].toLocaleString()}원</span>
    </div>
    <div class="quantity-controls">
      <button type="button" class="q-dec">-</button>
      <input type="number" class="q-input" value="1" min="1" data-product="${product}" />
      <button type="button" class="q-inc">+</button>
    </div>
    <button class="delete-button" type="button">×</button>
  `;
  selectedItemsEl.appendChild(wrap);
  updateTotalPrice();
}

selectedItemsEl.addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (!item) return;

  if (e.target.classList.contains('delete-button')) {
    item.remove();
    updateTotalPrice();
  }
  if (e.target.classList.contains('q-dec')) {
    const input = item.querySelector('.q-input');
    if (+input.value > 1) { input.value = +input.value - 1; updateItemPrice(input); }
  }
  if (e.target.classList.contains('q-inc')) {
    const input = item.querySelector('.q-input');
    input.value = +input.value + 1;
    updateItemPrice(input);
  }
});

selectedItemsEl.addEventListener('change', (e) => {
  if (e.target.classList.contains('q-input')) {
    if (+e.target.value < 1) e.target.value = 1;
    updateItemPrice(e.target);
  }
});

function updateItemPrice(input) {
  const product = input.dataset.product;
  const quantity = parseInt(input.value, 10) || 1;
  const priceEl = input.closest('.item').querySelector('.item-price');
  priceEl.textContent = `${(itemPrices[product] * quantity).toLocaleString()}원`;
  updateTotalPrice();
}

function updateTotalPrice() {
  const items = selectedItemsEl.querySelectorAll('.item');
  let total = 0;
  items.forEach(item => {
    const priceText = item.querySelector('.item-price').textContent;
    const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
    total += price;
  });
  document.getElementById('product-price').textContent = `${total.toLocaleString()}원`;
  document.getElementById('shipping-fee').textContent = `0원`; // 상품가에 배송비 포함
  document.getElementById('total-price').textContent = `${total.toLocaleString()}원`;
}

/**************************
 * 주문자=수령인 동기화
 **************************/
document.getElementById('same-as-order').addEventListener('change', function () {
  if (this.checked) {
    document.getElementById('recipient-name').value = document.getElementById('order-name').value;
    document.getElementById('recipient-phone').value = document.getElementById('order-phone').value;
  } else {
    document.getElementById('recipient-name').value = '';
    document.getElementById('recipient-phone').value = '';
  }
});

/**************************
 * 제출(구글 앱스 스크립트로 전송)
 * - 존재하지 않는 요소 접근 제거
 * - 선택 아이템 목록 전송
 **************************/
document.getElementById('reservation-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  // 필수: 최소 1개 상품
  const items = Array.from(selectedItemsEl.querySelectorAll('.item')).map(item => {
    const name = item.querySelector('.item-name').textContent.trim();
    const input = item.querySelector('.q-input');
    const product = input.dataset.product;
    const qty = parseInt(input.value, 10) || 1;
    const unit = itemPrices[product] || 0;
    return { product, name, quantity: qty, unitPrice: unit, lineTotal: unit * qty };
  });
  if (items.length === 0) {
    alert('상품을 최소 1개 이상 추가해 주세요.');
    return;
  }

  const payload = {
    order: {
      name: document.getElementById('order-name').value.trim(),
      phone: document.getElementById('order-phone').value.trim()
    },
    shipping: {
      recipientName: document.getElementById('recipient-name').value.trim(),
      recipientPhone: document.getElementById('recipient-phone').value.trim(),
      postcode: document.getElementById('sample6_postcode').value.trim(),
      address: document.getElementById('sample6_address').value.trim(),
      detailAddress: document.getElementById('sample6_detailAddress').value.trim()
    },
    items,
    totals: {
      productTotal: items.reduce((s, it) => s + it.lineTotal, 0),
      shippingFee: 0,
      grandTotal: items.reduce((s, it) => s + it.lineTotal, 0)
    },
    createdAt: new Date().toISOString()
  };

  try {
    const res = await fetch('https://script.google.com/macros/s/AKfycbxF7LAt3jgpnjyL4lt79sbzPjO4ZbDvQiyo_hBzJFIdd7PXPWEeVXJujB5nLASfvxCg/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (data?.success) {
      alert('예약이 성공적으로 완료되었습니다.');
      // 필요하면 location.reload();
    } else {
      alert('예약에 실패했습니다. 다시 시도해 주세요.');
    }
  } catch (err) {
    console.error(err);
    alert('예약에 실패했습니다. 다시 시도해 주세요.');
  }
});


/***** 카드형 상품 선택용 로직 *****/
function addSpecificItem(product, qty){
  const productName = product === '2kg' ? '2kg 3-4수' : '4kg 5-6수';

  const wrap = document.createElement('div');
  wrap.className = 'item';
  wrap.innerHTML = `
    <div class="item-info">
      <span class="item-name">${productName}</span>
      <span class="item-price">${(itemPrices[product] * qty).toLocaleString()}원</span>
    </div>
    <div class="quantity-controls">
      <button type="button" class="q-dec">-</button>
      <input type="number" class="q-input" value="${qty}" min="1" data-product="${product}" />
      <button type="button" class="q-inc">+</button>
    </div>
    <button class="delete-button" type="button">×</button>
  `;
  selectedItemsEl.appendChild(wrap);
  updateTotalPrice();
}

// 카드 내부 버튼 이벤트 (이벤트 위임)
document.querySelector('.product-picker').addEventListener('click', (e) => {
  const card = e.target.closest('.option-card');
  if (!card) return;
  const qtyInput = card.querySelector('.opt-qty');
  const product = card.dataset.product;

  if (e.target.classList.contains('opt-inc')) {
    qtyInput.value = String((parseInt(qtyInput.value, 10) || 1) + 1);
  }
  if (e.target.classList.contains('opt-dec')) {
    const next = (parseInt(qtyInput.value, 10) || 1) - 1;
    qtyInput.value = String(next < 1 ? 1 : next);
  }
  if (e.target.classList.contains('add-option')) {
    const qty = parseInt(qtyInput.value, 10) || 1;
    addSpecificItem(product, qty);
    // 담은 뒤 수량을 1로 리셋(선택)
    qtyInput.value = '1';
  }
});
