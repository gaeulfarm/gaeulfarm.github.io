document.getElementById('same-as-order').addEventListener('change', function(){
  if(this.checked){
    document.getElementById('recipient-name').value = document.getElementById('order-name').value;
    document.getElementById('recipient-phone').value = document.getElementById('order-phone').value;
  }
});

document.getElementById('reservation-form').addEventListener('submit',(e)=>{
  e.preventDefault();
  alert("예약이 완료되었습니다 ✅");
});

/**************************
 * 구매하기 버튼 → 주문서 폼 열기
 **************************/
const buyBanner = document.querySelector('.buy-banner');
const buyBtn = buyBanner.querySelector('.buy-button');
const reservationForm = document.getElementById('reservation-form');

buyBtn.addEventListener('click', () => {
  // 구매하기 배너 숨기기
  buyBanner.style.display = 'none';

  // 주문서 폼 보이기
  reservationForm.style.display = 'block';

  // 스크롤 이동 (부드럽게)
  reservationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/**************************
 * 폼 관련 - 전화번호 포맷, 주문자=수령인 동기화
 **************************/
function formatKoreanPhone(v) {
  const digits = (v || '').replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return digits.replace(/^(\d{3})(\d+)/, '$1-$2');
  return digits.replace(/^(\d{3})(\d{4})(\d{0,4}).*/, (m, a, b, c) => c ? `${a}-${b}-${c}` : `${a}-${b}`);
}

const orderPhoneEl = document.getElementById('order-phone');
const recipientPhoneEl = document.getElementById('recipient-phone');
const sameAsOrderEl = document.getElementById('same-as-order');
const orderNameEl = document.getElementById('order-name');
const recipientNameEl = document.getElementById('recipient-name');

[orderPhoneEl, recipientPhoneEl].forEach(el => {
  el.addEventListener('input', (e) => {
    const sel = el.selectionStart;
    el.value = formatKoreanPhone(el.value);
    // 간단한 caret 위치 보정은 생략(브라우저 기본으로 충분)
  });
});

// 주문자=수령인 동기화
sameAsOrderEl.addEventListener('change', () => {
  if (sameAsOrderEl.checked) {
    recipientNameEl.value = orderNameEl.value;
    recipientPhoneEl.value = orderPhoneEl.value;
  } else {
    recipientNameEl.value = '';
    recipientPhoneEl.value = '';
  }
});

// 주문자 이름/전화 변경 시 동기화 유지
orderNameEl.addEventListener('input', () => {
  if (sameAsOrderEl.checked) recipientNameEl.value = orderNameEl.value;
});
orderPhoneEl.addEventListener('input', () => {
  if (sameAsOrderEl.checked) recipientPhoneEl.value = orderPhoneEl.value;
});

/**************************
 * 계좌 복사 기능
 **************************/
function copyAccount() {
  const accountText = document.getElementById('bank-account').textContent;
  navigator.clipboard.writeText(accountText)
    .then(() => {
      console.log('계좌 정보가 복사되었습니다:', accountText);
    })
    .catch(err => {
      console.error('복사 실패:', err);
    });
}

