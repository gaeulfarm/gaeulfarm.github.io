/**************************
 * 제출(구글 앱스 스크립트로 전송)
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
    } else {
      alert('예약에 실패했습니다. 다시 시도해 주세요.');
    }
  } catch (err) {
    console.error(err);
    alert('예약에 실패했습니다. 다시 시도해 주세요.');
  }
});