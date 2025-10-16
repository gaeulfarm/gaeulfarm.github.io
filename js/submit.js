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

  // 구글 시트 컬럼 구조에 맞는 데이터 생성
  const payload = {
    "2kg 박스": qty2kg.toString(),
    "4kg 박스": qty4kg.toString(),
    "주문자 이름": document.getElementById('order-name').value.trim(),
    "주문자 연락처": document.getElementById('order-phone').value.trim(),
    "수령인 이름": document.getElementById('recipient-name').value.trim(),
    "수령인 연락처": document.getElementById('recipient-phone').value.trim(),
    "우편번호": document.getElementById('sample6_postcode').value.trim(),
    "주소": fullAddress,
    "수령 희망일": document.getElementById('delivery-date').value.trim(),
    "입금자명": document.getElementById('depositor-name').value.trim(),
    "가격": totalPrice.toLocaleString()
  };

  // 제출 버튼 비활성화
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '처리 중...';

  try {
    const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwPanCSYwzbpfpfwbgppaMvXcehNreXViZYjvH3KkrrqrZNlfxvFpBKiVl1GJxWjkYM3A/exec?gid=0';
    
    // JSONP 방식으로 폼 제출
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = WEBHOOK_URL;
    form.target = '_blank'; // 새 탭에서 결과 표시
    
    // 데이터를 hidden input으로 추가
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(payload);
    form.appendChild(input);
    
    // 폼 제출
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // 성공 메시지 표시
    alert('✅ 예약이 성공적으로 완료되었습니다!\n\n입금 확인 후 배송이 시작됩니다.');
    
    // 폼 초기화
    document.getElementById('reservation-form').reset();
    // 주문 요약도 초기화
    document.getElementById('order-summary-list').innerHTML = '';
    document.getElementById('total-price').textContent = '0원';
    
  } catch (err) {
    console.error('제출 오류:', err);
    alert('❌ 예약에 실패했습니다.\n\n다시 시도해 주세요.');
  } finally {
    // 제출 버튼 복원
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});