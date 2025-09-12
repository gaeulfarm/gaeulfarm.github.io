class Calendar {
  constructor(inputElement) {
    this.input = inputElement;
    this.popup = null;
    this.selectedDate = null;
    this.currentDate = new Date();
    this.minDate = this.getMinDate();

    this.init();
  }

  getMinDate() {
    const date = new Date();
    date.setDate(date.getDate() + 2); // 주문일 기준 2일 후부터
    return date;
  }

  init() {
    this.input.addEventListener('click', () => this.showCalendar());
    document.addEventListener('click', (e) => {
      if (this.popup && !this.popup.contains(e.target) && e.target !== this.input) {
        this.hideCalendar();
      }
    });
  }

  showCalendar() {
    if (this.popup) {
      this.hideCalendar();
      return;
    }

    this.popup = document.createElement('div');
    this.popup.className = 'calendar-popup';
    this.renderCalendar();
    // iOS Safari에서 포커스/키보드로 인해 위치가 밀리지 않도록 부모에 상대 위치 보장
    const parent = this.input.parentNode;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
    this.input.parentNode.appendChild(this.popup);
  }

  hideCalendar() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
      <h3>${year}년 ${month + 1}월</h3>
      <div class="calendar-nav">
        <button type="button" class="prev-month">‹</button>
        <button type="button" class="next-month">›</button>
      </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    // 요일 헤더
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach(day => {
      const dayEl = document.createElement('div');
      dayEl.className = 'weekday';
      dayEl.textContent = day;
      grid.appendChild(dayEl);
    });

    // 날짜 그리드
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 이전 달의 마지막 날짜들
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const dateEl = document.createElement('div');
      dateEl.className = 'date disabled';
      dateEl.textContent = prevMonthLastDate - i;
      grid.appendChild(dateEl);
    }

    // 현재 달의 날짜들
    for (let date = 1; date <= lastDate; date++) {
      const dateEl = document.createElement('div');
      dateEl.className = 'date';
      dateEl.textContent = date;

      const currentDateObj = new Date(year, month, date);
      
      // 오늘 날짜 표시
      if (this.isToday(currentDateObj)) {
        dateEl.classList.add('today');
      }

      // 선택된 날짜 표시
      if (this.isSelected(currentDateObj)) {
        dateEl.classList.add('selected');
      }

      // 최소 날짜 이전은 비활성화
      if (currentDateObj < this.minDate) {
        dateEl.classList.add('disabled');
      } else {
        dateEl.addEventListener('click', () => this.selectDate(currentDateObj));
      }

      grid.appendChild(dateEl);
    }

    // 다음 달의 시작 날짜들
    const remainingDays = 42 - (firstDay + lastDate); // 6주 채우기
    for (let i = 1; i <= remainingDays; i++) {
      const dateEl = document.createElement('div');
      dateEl.className = 'date disabled';
      dateEl.textContent = i;
      grid.appendChild(dateEl);
    }

    this.popup.innerHTML = '';
    this.popup.appendChild(header);
    this.popup.appendChild(grid);

    // 이전/다음 달 버튼 이벤트
    this.popup.querySelector('.prev-month').addEventListener('click', () => this.changeMonth(-1));
    this.popup.querySelector('.next-month').addEventListener('click', () => this.changeMonth(1));
  }

  changeMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.renderCalendar();
  }

  selectDate(date) {
    this.selectedDate = date;
    this.input.value = this.formatDate(date);
    this.hideCalendar();
  }

  isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }

  isSelected(date) {
    if (!this.selectedDate) return false;
    return date.getFullYear() === this.selectedDate.getFullYear() &&
           date.getMonth() === this.selectedDate.getMonth() &&
           date.getDate() === this.selectedDate.getDate();
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
}

// 달력 초기화
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('delivery-date');
  if (dateInput) {
    new Calendar(dateInput);
  }
});
