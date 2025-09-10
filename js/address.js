/**************************
 * 주소검색(다음 우편번호)
 **************************/
function sample6_execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = '';
      let extraAddr = '';
      if (data.userSelectedType === 'R') addr = data.roadAddress;
      else addr = data.jibunAddress;

      if (data.userSelectedType === 'R') {
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddr += (extraAddr !== '' ? ', ' : '') + data.buildingName;
        }
        if (extraAddr !== '') addr += ' (' + extraAddr + ')';
      }

      document.getElementById('sample6_postcode').value = data.zonecode;
      document.getElementById('sample6_address').value = addr;
      document.getElementById('sample6_detailAddress').focus();
    }
  }).open();
}
document.getElementById('addrBtn').addEventListener('click', sample6_execDaumPostcode);
