/**
 * 폼 유효성 검사 및 에러 메시지 처리
 */

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

/**
 * 에러 메시지 표시
 */
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

/**
 * 에러 메시지 숨기기
 */
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

/**
 * 전체 에러 요약 표시
 */
function showErrorSummary(errors) {
  const summaryElement = document.getElementById('form-error-summary');
  const errorList = document.getElementById('error-list');
  
  if (!summaryElement || !errorList) return;
  
  errorList.innerHTML = '';
  errors.forEach(error => {
    const li = document.createElement('li');
    li.textContent = error;
    errorList.appendChild(li);
  });
  
  summaryElement.classList.add('show');
  
  // 에러 요약으로 스크롤
  summaryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * 전체 에러 요약 숨기기
 */
function hideErrorSummary() {
  const summaryElement = document.getElementById('form-error-summary');
  if (summaryElement) {
    summaryElement.classList.remove('show');
  }
}

/**
 * 전화번호 유효성 검사
 */
function validatePhone(phone) {
  const phoneRegex = /^01[0-9]-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
}

/**
 * 개별 필드 유효성 검사
 */
function validateField(field) {
  const element = document.getElementById(field.id);
  if (!element) return { isValid: true };
  
  const value = element.value.trim();
  
  // 빈 값 체크
  if (!value) {
    return {
      isValid: false,
      message: `${field.name}은(는) 필수 입력 사항입니다.`
    };
  }
  
  // 전화번호 형식 체크
  if (field.type === 'phone' && !validatePhone(value)) {
    return {
      isValid: false,
      message: `${field.name}을(를) 올바른 형식으로 입력해주세요. (예: 010-1234-5678)`
    };
  }
  
  return { isValid: true };
}

/**
 * 주문 상품 유효성 검사
 */
function validateOrderItems() {
  const summaryList = document.getElementById('order-summary-list');
  const items = summaryList?.querySelectorAll('.summary-item');
  
  if (!items || items.length === 0) {
    return {
      isValid: false,
      message: '주문 상품이 없습니다.'
    };
  }
  
  return { isValid: true };
}

/**
 * 전체 폼 유효성 검사
 */
function validateForm() {
  const errors = [];
  let firstErrorField = null;
  
  // 모든 에러 메시지 초기화
  REQUIRED_FIELDS.forEach(field => {
    hideFieldError(field.id);
  });
  hideErrorSummary();
  
  // 주문 상품 검사
  const itemValidation = validateOrderItems();
  if (!itemValidation.isValid) {
    errors.push(itemValidation.message);
  }
  
  // 필수 필드 검사
  REQUIRED_FIELDS.forEach(field => {
    const validation = validateField(field);
    if (!validation.isValid) {
      errors.push(validation.message);
      showFieldError(field.id, validation.message);
      
      // 첫 번째 에러 필드 저장
      if (!firstErrorField) {
        firstErrorField = document.getElementById(field.id);
      }
    }
  });
  
  // 에러가 있으면 처리
  if (errors.length > 0) {
    showErrorSummary(errors);
    
    // 첫 번째 에러 필드에 포커스
    if (firstErrorField) {
      setTimeout(() => {
        firstErrorField.focus();
      }, 100);
    }
    
    return false;
  }
  
  return true;
}

/**
 * 실시간 유효성 검사 (입력 중)
 */
function setupRealTimeValidation() {
  REQUIRED_FIELDS.forEach(field => {
    const element = document.getElementById(field.id);
    if (!element) return;
    
    // 포커스 아웃 시 검사
    element.addEventListener('blur', () => {
      const validation = validateField(field);
      if (!validation.isValid) {
        showFieldError(field.id, validation.message);
      } else {
        hideFieldError(field.id);
      }
    });
    
    // 입력 중일 때 에러 메시지 숨기기
    element.addEventListener('input', () => {
      hideFieldError(field.id);
    });
  });
}

/**
 * 초기화
 */
document.addEventListener('DOMContentLoaded', () => {
  setupRealTimeValidation();
});

// 전역으로 내보내기
window.validateForm = validateForm;
window.validateOrderItems = validateOrderItems;
