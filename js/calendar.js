// js/calendar.js
class Calendar {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.popup = null;
    this.selectedDate = null;
    this.currentDate = new Date();
    this.minDate = options.minDate || this.getMinDate();
    this.weekdays = options.weekdays || ['일', '월', '화', '수', '목', '금', '토'];

    // 바인딩(나중에 removeEventListener용)
    this.handleDocClick = this.handleDocClick.bind(this);

    this.init();
  }

  getMinDate() {
    const d = new Date();
    d.setDate(d.getDate() + 2); // 주문일 기준 2일 후부터 선택 가능
    d.setHours(0, 0, 0, 0);
    return d;
  }

  init() {
    // 입력 클릭/키보드로 열기
    this.input.addEventListener('click', () => this.showCalendar());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.showCalendar();
      }
    });
  }

  showCalendar() {
    // 이미 열려 있으면 토글로 닫기
    if (this.popup) {
      this.hideCalendar();
      return;
    }

    // 팝업 생성
    this.popup = document.createElement('div');
    this.popup.className = 'calendar-popup';
    // 팝업 내부 클릭이 문서 닫기 로직으로 전파되지 않게
    this.popup.addEventListener('click', (e) => e.stopPropagation());

    // iOS Safari에서 레이아웃 밀림 방지: 부모를 상대위치로
    const parent = this.input.parentNode;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
    parent.appendChild(this.popup);

    // 문서 클릭 시 외부 클릭 감지로 닫기 (한 번만 등록)
    document.addEventListener('click', this.handleDocClick);

    // 렌더링
    this.renderCalendar();
  }

  hideCalendar() {
    if (this.popup) {
      // 정리
      document.removeEventListener('click', this.handleDocClick);
      this.popup.remove();
      this.popup = null;
    }
  }

  handleDocClick(e) {
    if (!this.popup) return;
    // input 자신을 다시 클릭하면 토글로 닫히게 하고, 그 외 외부 클릭도 닫기
    if (e.target !== this.input && !this.popup.contains(e.target)) {
      this.hideCalendar();
    }
  }

  renderCalendar() {
    if (!this.popup) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // 헤더
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
      <button type="button" class="prev-month" aria-label="이전 달">‹</button>
      <h3>${year}년 ${month + 1}월</h3>
      <button type="button" class="next-month" aria-label="다음 달">›</button>
    `;

    // 그리드
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    // 요일 헤더
    this.weekdays.forEach(day => {
      const el = document.createElement('div');
      el.className = 'weekday';
      el.textContent = day;
      grid.appendChild(el);
    });

    // 날짜 채우기
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 이전 달 앞부분 채우기
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const el = document.createElement('div');
      el.className = 'date disabled';
      el.textContent = prevLast - i;
      grid.appendChild(el);
    }

    // 이번 달 날짜
    for (let d = 1; d <= lastDate; d++) {
      const el = document.createElement('div');
      el.className = 'date';
      el.textContent = d;

      const dateObj = new Date(year, month, d);
      dateObj.setHours(0, 0, 0, 0);

      if (this.isToday(dateObj)) el.classList.add('today');
      if (this.isSelected(dateObj)) el.classList.add('selected');

      if (dateObj < this.minDate) {
        el.classList.add('disabled');
      } else {
        el.addEventListener('click', (e) => {
          e.stopPropagation(); // 닫힘 전파 방지
          this.selectDate(dateObj);
        });
      }
      grid.appendChild(el);
    }

    // 다음 달 뒷부분 채우기 (6주 = 42칸)
    const filled = firstDay + lastDate;
    const remain = 42 - filled;
    for (let i = 1; i <= remain; i++) {
      const el = document.createElement('div');
      el.className = 'date disabled';
      el.textContent = i;
      grid.appendChild(el);
    }

    // 팝업 내용 교체
    this.popup.innerHTML = '';
    this.popup.appendChild(header);
    this.popup.appendChild(grid);

    // 네비게이션 이벤트 (전파 방지로 닫힘 방지)
    this.popup.querySelector('.prev-month').addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeMonth(-1);
    });
    this.popup.querySelector('.next-month').addEventListener('click', (e) => {
      e.stopPropagation();
      this.changeMonth(1);
    });
  }

  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.renderCalendar();
  }

  selectDate(date) {
    this.selectedDate = date;
    this.input.value = this.formatDate(date);
    // 선택 이벤트를 외부에서 감지할 수 있게
    this.input.dispatchEvent(new Event('change'));
    this.hideCalendar();
  }

  isToday(date) {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return date.getTime() === t.getTime();
  }

  isSelected(date) {
    if (!this.selectedDate) return false;
    return date.getFullYear() === this.selectedDate.getFullYear() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getDate() === this.selectedDate.getDate();
  }

  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }
}

// 달력 초기화 (중복 로직 없이 이것만!)
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('delivery-date');
  if (dateInput) new Calendar(dateInput);
});
