const sliderWrapper = document.querySelector('.slider-wrapper');
const images = document.querySelectorAll('.slider-wrapper img');
const dots = document.querySelectorAll('.dot');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
let currentIndex = 1;
let isTransitioning = false;
let startX = 0;
let isDragging = false;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;
const threshold = 50;  // 슬라이드 동작을 위한 최소 이동 거리
const totalSlides = images.length - 2;  // 복제된 슬라이드 제외

function updateSliderPosition() {
    sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function showImage(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = index;
    sliderWrapper.style.transition = 'transform 0.5s ease-in-out';
    updateSliderPosition();
    sliderWrapper.addEventListener('transitionend', () => {
        if (currentIndex === 0) {
            sliderWrapper.style.transition = 'none';
            currentIndex = totalSlides;
            updateSliderPosition();
        }
        if (currentIndex === images.length - 1) {
            sliderWrapper.style.transition = 'none';
            currentIndex = 1;
            updateSliderPosition();
        }
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex - 1);
        });
        isTransitioning = false;
    }, { once: true });
}

function nextImage() {
    if (currentIndex < images.length - 1) {
        showImage(currentIndex + 1);
    }
}

function prevImage() {
    if (currentIndex > 0) {
        showImage(currentIndex - 1);
    }
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showImage(index + 1);
    });
});

rightArrow.addEventListener('click', nextImage);
leftArrow.addEventListener('click', prevImage);

sliderWrapper.addEventListener('pointerdown', touchStart);
sliderWrapper.addEventListener('pointermove', touchMove);
sliderWrapper.addEventListener('pointerup', touchEnd);
sliderWrapper.addEventListener('pointercancel', touchEnd);
sliderWrapper.addEventListener('pointerleave', touchEnd);

function touchStart(event) {
    startX = event.clientX || event.touches[0].clientX;
    isDragging = true;
    sliderWrapper.style.transition = 'none';
    prevTranslate = currentTranslate;
    animationID = requestAnimationFrame(animation);
}

function touchMove(event) {
    if (!isDragging) return;
    const currentX = event.clientX || event.touches[0].clientX;
    const moveX = currentX - startX;
    currentTranslate = prevTranslate + moveX;
    sliderWrapper.style.transform = `translateX(${currentTranslate}px)`;
}

function touchEnd() {
    cancelAnimationFrame(animationID);
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;
    
    if (movedBy < -threshold && currentIndex < images.length - 1) {
        nextImage();
    } else if (movedBy > threshold && currentIndex > 0) {
        prevImage();
    } else {
        updateSliderPosition();
    }
}

function animation() {
    sliderWrapper.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
}

// 초기 슬라이더 위치 설정
updateSliderPosition();

// 다음 우편번호 서비스 API를 사용하여 주소를 검색하고 입력 필드에 자동으로 채워줍니다.
function sample6_execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            var addr = ''; // 주소 변수
            var extraAddr = ''; // 참고항목 변수

            // 사용자가 선택한 주소 유형에 따라 도로명 주소와 지번 주소를 구분합니다.
            if (data.userSelectedType === 'R') { 
                addr = data.roadAddress;
            } else { 
                addr = data.jibunAddress;
            }

            // 참고항목을 추가로 작성합니다. (예: 아파트 명 등)
            if(data.userSelectedType === 'R'){
                if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                    extraAddr += data.bname;
                }
                if(data.buildingName !== '' && data.apartment === 'Y'){
                    extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                if(extraAddr !== ''){
                    extraAddr = ' (' + extraAddr + ')';
                }
                addr += extraAddr; // 참고항목을 주소에 추가합니다.
            }

            // 우편번호와 주소 정보를 해당 필드에 입력합니다.
            document.getElementById('sample6_postcode').value = data.zonecode;
            document.getElementById("sample6_address").value = addr;
            
            // 상세주소 필드로 포커스를 이동합니다.
            document.getElementById("sample6_detailAddress").focus();
        }
    }).open();
}

// 구매하기 버튼을 눌렀을 때 주문 폼을 보여주고, 구매 배너를 숨깁니다.
function showForm() {
    document.querySelector('.buy-banner').style.display = 'none';
    document.getElementById('reservation-form').style.display = 'block';
    setTimeout(function() {
        document.getElementById('reservation-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// 주문자 정보와 배송 정보가 동일할 경우 배송 정보를 자동으로 채워줍니다.
document.getElementById('same-as-order').addEventListener('change', function() {
    if (this.checked) {
        document.getElementById('recipient-name').value = document.getElementById('order-name').value;
        document.getElementById('recipient-phone').value = document.getElementById('order-phone').value;
    } else {
        document.getElementById('recipient-name').value = '';
        document.getElementById('recipient-phone').value = '';
    }
});

const itemPrices = {
    "2kg": 25000,
    "4kg": 45000
};

function addItem() {
    const productSelect = document.getElementById('product-select');
    const selectedItems = document.getElementById('selected-items');

    const product = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].text;

    const itemElement = document.createElement('div');
    itemElement.className = 'item';
    itemElement.innerHTML = `
        <div class="item-info">
            <span class="item-name">${productName}</span>
            <span class="item-price">${itemPrices[product].toLocaleString()}원</span>
        </div>
        <div class="quantity-controls">
            <button onclick="decreaseQuantity(this)">-</button>
            <input type="number" value="1" min="1" data-product="${product}" onchange="updatePrice(this)">
            <button onclick="increaseQuantity(this)">+</button>
        </div>
        <button class="delete-button" onclick="deleteItem(this)">×</button>
    `;

    selectedItems.appendChild(itemElement);
    updateTotalPrice();
}

function decreaseQuantity(button) {
    const input = button.nextElementSibling;
    if (input.value > 1) {
        input.value--;
        updatePrice(input);
    }
}

function increaseQuantity(button) {
    const input = button.previousElementSibling;
    input.value++;
    updatePrice(input);
}

function updatePrice(input) {
    const product = input.getAttribute('data-product');
    const quantity = parseInt(input.value);
    const priceElement = input.closest('.item').querySelector('.item-price');
    const totalPrice = itemPrices[product] * quantity;
    priceElement.textContent = `${totalPrice.toLocaleString()}원`;
    updateTotalPrice();
}

function deleteItem(button) {
    const itemElement = button.parentElement;
    itemElement.remove();
    updateTotalPrice();
}

function updateTotalPrice() {
    const selectedItems = document.getElementById('selected-items').children;
    let totalPrice = 0;

    Array.from(selectedItems).forEach(item => {
        const priceText = item.querySelector('.item-price').textContent;
        const price = parseInt(priceText.replace(/[^0-9]/g, ''));
        totalPrice += price;
    });

    document.getElementById('product-price').textContent = `${totalPrice.toLocaleString()}원`;
    document.getElementById('total-price').textContent = `${totalPrice.toLocaleString()}원`;
}

// 폼 제출 시 데이터를 서버로 전송합니다.
document.getElementById('reservation-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('order-name').value;
    const phone = document.getElementById('order-phone').value;
    const recipientName = document.getElementById('recipient-name').value;
    const recipientPhone = document.getElementById('recipient-phone').value;
    const postcode = document.getElementById('sample6_postcode').value;
    const address = document.getElementById('sample6_address').value;
    const detailAddress = document.getElementById('sample6_detailAddress').value;
    const extraAddress = document.getElementById('sample6_extraAddress').value;
    const quantity = document.getElementById('quantity').value;

    fetch('https://script.google.com/macros/s/AKfycbxF7LAt3jgpnjyL4lt79sbzPjO4ZbDvQiyo_hBzJFIdd7PXPWEeVXJujB5nLASfvxCg/exec', {
        method: 'POST',
        body: JSON.stringify({
            name, 
            phone, 
            recipientName,
            recipientPhone,
            postcode, 
            address, 
            detailAddress, 
            extraAddress, 
            quantity
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('예약이 성공적으로 완료되었습니다.');
        } else {
            alert('예약에 실패했습니다. 다시 시도해 주세요.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('예약에 실패했습니다. 다시 시도해 주세요.');
    });
});

// 연락처 입력란에서 숫자 키패드가 나타나도록 설정
document.getElementById('order-phone').setAttribute('type', 'tel');
document.getElementById('recipient-phone').setAttribute('type', 'tel');
