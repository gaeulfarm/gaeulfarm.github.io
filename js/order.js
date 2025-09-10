/**************************
 * 주문 아이템 및 합계 (재작성)
 **************************/
const itemPrices = { "2kg": 25000, "4kg": 45000 };
const orderItems = {}; // key: product, value: { product, name, qty, unitPrice }
window.orderItems = orderItems; // submit.js에서 사용 가능

const productCards = document.querySelectorAll('.option-card');
const summaryListEl = document.getElementById('order-summary-list');
const totalPriceEl = document.getElementById('total-price');

function formatCurrency(n) {
  return `${n.toLocaleString()}원`;
}

function renderSummary() {
  const items = Object.values(orderItems);
  summaryListEl.innerHTML = '';
  if (items.length === 0) {
    summaryListEl.innerHTML = '<p class="empty">아직 담긴 상품이 없습니다.</p>';
    totalPriceEl.textContent = formatCurrency(0);
    return;
  }

  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'summary-item';
    row.dataset.product = it.product;
    row.innerHTML = `
      <div class="summary-left">
        <div class="summary-name">${it.name}</div>
        <div class="summary-qty">${it.qty}개</div>
      </div>
      <div class="summary-right">
        <div class="summary-price">${formatCurrency(it.qty * it.unitPrice)}</div>
        <button type="button" class="summary-delete" aria-label="삭제">×</button>
      </div>
    `;
    summaryListEl.appendChild(row);
  });

  const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  totalPriceEl.textContent = formatCurrency(total);
}

// 카드의 수량 버튼과 담기 버튼 동작 초기화
productCards.forEach(card => {
  const product = card.dataset.product;
  const title = card.querySelector('.option-title').textContent.trim();
  const priceText = card.querySelector('.option-price').textContent.replace(/[^\d]/g, '');
  const unitPrice = parseInt(priceText, 10) || itemPrices[product] || 0;
  const decBtn = card.querySelector('.opt-dec');
  const incBtn = card.querySelector('.opt-inc');
  const qtyInput = card.querySelector('.opt-qty');
  const addBtn = card.querySelector('.add-option');

  // 버튼으로만 수량 조절
  decBtn.addEventListener('click', () => {
    let v = parseInt(qtyInput.value, 10) || 1;
    if (v > 1) v -= 1;
    qtyInput.value = v;
  });
  incBtn.addEventListener('click', () => {
    let v = parseInt(qtyInput.value, 10) || 1;
    v += 1;
    qtyInput.value = v;
  });

  // 담기
  addBtn.addEventListener('click', () => {
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    if (orderItems[product]) {
      orderItems[product].qty += qty;
    } else {
      orderItems[product] = { product, name: `${title}`, qty, unitPrice };
    }
    renderSummary();
    // 간단한 피드백
    addBtn.textContent = '담았습니다';
    setTimeout(() => addBtn.textContent = '담기', 800);
  });
});

// 삭제 버튼 (요약 영역) 위임
summaryListEl.addEventListener('click', (e) => {
  const del = e.target.closest('.summary-delete');
  if (!del) return;
  const itemRow = del.closest('.summary-item');
  const product = itemRow.dataset.product;
  if (product && orderItems[product]) {
    delete orderItems[product];
    renderSummary();
  }
});

// 초기 렌더
renderSummary();