// 필수 필드 정의
const REQUIRED_FIELDS = [
  { id: 'order-name', name: '주문자 이름', type: 'text' },
  { id: 'order-phone', name: '주문자 연락처', type: 'phone' },
  { id: 'recipient-name', name: '수령인', type: 'text' },
  { id: 'recipient-phone', name: '수령인 연락처', type: 'phone' },
  { id: 'sample6_postcode', name: '우편번호', type: 'text' },
  { id: 'sample6_address', name: '주소', type: 'text' },
  { id: 'sample6_detailAddress', name: '상세주소', type: 'text' },
  { id: 'delivery-date', name: '수령 희망일', type: 'text' },
  { id: 'depositor-name', name: '입금자명', type: 'text' }
];

// 전체 폼 유효성 검사
function validateForm() {
  // 주문 상품 검사
  const items = document.getElementById('order-summary-list')?.querySelectorAll('.summary-item');
  if (!items?.length) {
    alert('❌ 주문 상품이 존재하지 않습니다. 다시 확인해주세요.');
    return false;
  }
  
  // 필수 필드 검사
  const allFieldsValid = REQUIRED_FIELDS.every(field => {
    const value = document.getElementById(field.id)?.value.trim();
    return !!value;
  });
  
  if (!allFieldsValid) {
    alert('❌ 예약에 실패했습니다.\n주문서의 모든 필드를 채워주세요.');
    return false;
  }
  
  return true;
}

// 전화번호 형식 검사
function validatePhone(phone) {
  return /^01[0-9]-\d{4}-\d{4}$/.test(phone);
}

// 에러 메시지 표시/숨기기
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(fieldId + '-error');
  const formField = field?.closest('.form-field');
  
  if (formField) {
    formField.classList.add('error');
  }
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }
}

function hideFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(fieldId + '-error');
  const formField = field?.closest('.form-field');
  
  if (formField) {
    formField.classList.remove('error');
  }
  
  if (errorElement) {
    errorElement.classList.remove('show');
    errorElement.textContent = '';
  }
}

// 전화번호 필드 실시간 검사 설정
document.addEventListener('DOMContentLoaded', () => {
  REQUIRED_FIELDS
    .filter(field => field.type === 'phone')
    .forEach(field => {
      const element = document.getElementById(field.id);
      if (!element) return;

      // 포커스 아웃 시 검사
      element.addEventListener('blur', () => {
        const value = element.value.trim();
        if (value && !validatePhone(value)) {
          showFieldError(field.id, `${field.name}을(를) 올바른 형식으로 입력해주세요. (예: 010-1234-5678)`);
        }
      });

      // 입력 시작하면 에러 메시지 숨기기
      element.addEventListener('input', () => {
        hideFieldError(field.id);
      });
    });
});

// 전역으로 내보내기
window.validateForm = validateForm;
