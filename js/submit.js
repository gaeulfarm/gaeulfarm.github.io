/**************************
 * 제출(구글 앱스 스크립트로 전송)
 **************************/
document.getElementById('reservation-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  // 폼 유효성 검사
  if (!validateForm()) {
    return; // 유효성 검사 실패 시 제출 중단
  }

  // 주문 상품 데이터 수집 - 2kg, 4kg 박스 수량 계산
  const summaryItems = document.querySelectorAll('#order-summary-list .summary-item');
  let qty2kg = 0;
  let qty4kg = 0;
  let totalPrice = 0;

  Array.from(summaryItems).forEach(item => {
    const product = item.dataset.product;
    const qtyText = item.querySelector('.summary-qty').textContent.trim();
    const qty = parseInt(qtyText.replace(/[^\d]/g, ''), 10) || 0;
    const unitPrice = itemPrices[product] || 0;
    
    if (product === '2kg') {
      qty2kg += qty;
    } else if (product === '4kg') {
      qty4kg += qty;
    }
    totalPrice += unitPrice * qty;
  });

  // 주소 합치기 (주소 + 상세주소)
  const baseAddress = document.getElementById('sample6_address').value.trim();
  const detailAddress = document.getElementById('sample6_detailAddress').value.trim();
  const fullAddress = baseAddress + (detailAddress ? ' ' + detailAddress : '');

  // 구글 시트 컬럼 구조에 맞는 데이터 생성 (웹훅이 쿼리 파라미터로 값을 받음)
  const payload = {
    "2kg박스": qty2kg.toString(),
    "4kg박스": qty4kg.toString(),
    "주문자이름": document.getElementById('order-name').value.trim(),
    "주문자연락처": document.getElementById('order-phone').value.trim(),
    "수령인이름": document.getElementById('recipient-name').value.trim(),
    "수령인연락처": document.getElementById('recipient-phone').value.trim(),
    "우편번호": document.getElementById('sample6_postcode').value.trim(),
    "주소": fullAddress,
    "수령희망일": document.getElementById('delivery-date').value.trim(),
    "입금자명": document.getElementById('depositor-name').value.trim(),
    "가격": totalPrice.toLocaleString()
  };

  // 제출 버튼 비활성화
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '처리 중...';

  // 인스타그램 등 인앱 브라우저는 alert()를 막는 경우가 있어 화면에 직접 표시한다
  const statusEl = document.getElementById('submit-status');
  const showStatus = (message, isSuccess) => {
    statusEl.textContent = message;
    statusEl.classList.toggle('is-success', isSuccess);
    statusEl.classList.toggle('is-error', !isSuccess);
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };
  statusEl.textContent = '';
  statusEl.classList.remove('is-success', 'is-error');

  try {
    const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxF7LAt3jgpnjyL4lt79sbzPjO4ZbDvQiyo_hBzJFIdd7PXPWEeVXJujB5nLASfvxCg/exec';
    const query = new URLSearchParams(payload).toString();

    const res = await fetch(`${WEBHOOK_URL}?${query}`, {
      method: 'POST'
    });
    
    const data = await res.json().catch(() => ({}));
    
    if (res.ok && (data?.success !== false)) {
      showStatus('✅ 예약이 성공적으로 완료되었습니다!\n 입금 확인이 되어야 배송준비가 시작됩니다.', true);

      // 폼 초기화
      document.getElementById('reservation-form').reset();
      // 주문 요약도 초기화 (담긴 상품 데이터까지 완전히 비움)
      resetOrderItems();
    } else {
      throw new Error(data?.message || '서버 오류가 발생했습니다.');
    }

  } catch (err) {
    console.error('제출 오류:', err);
    showStatus('❌ 예약에 실패했습니다. 다시 시도해 주세요.', false);
  } finally {
    // 제출 버튼 복원
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});