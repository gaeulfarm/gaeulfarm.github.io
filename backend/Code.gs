/**
 * 구글 스프레드시트에 바인딩된 Apps Script 프로젝트에 그대로 붙여넣으세요.
 * (스프레드시트 상단 메뉴 확장 프로그램 > Apps Script)
 *
 * 배포 방법: 배포 > 배포 관리 > 편집(연필 아이콘) > 새 버전으로 배포
 *   - 실행 대상: 나
 *   - 액세스 권한이 있는 사용자: 모든 사용자
 * 배포 후 나오는 웹 앱 URL이 js/submit.js 의 WEBHOOK_URL 과 같은 주소인지 확인하세요.
 */

// ===== 카카오 개발자 콘솔에서 발급받은 REST API 키를 입력하세요 =====
const KAKAO_REST_API_KEY = 'YOUR_KAKAO_REST_API_KEY';

// ===== 카카오 로그인 Redirect URI (이 웹 앱의 exec URL, 쿼리스트링 없이) =====
// 배포 후 나오는 실제 URL로 교체하세요. 예: https://script.google.com/macros/s/AKfycb.../exec
const KAKAO_REDIRECT_URI = 'YOUR_WEB_APP_EXEC_URL';

/**
 * 주문 폼에서 보낸 데이터를 저장하고, 카카오톡으로 알림을 보낸다.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const gid = e.parameter.gid || '0';

    appendOrderRow(gid, data);
    sendKakaoToMe(data);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * gid(시트탭 ID)로 대상 시트를 찾아 컬럼 순서대로 한 행을 추가한다.
 * 일치하는 gid가 없으면 첫 번째 시트에 기록한다.
 */
function appendOrderRow(gid, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheets().find(sh => String(sh.getSheetId()) === String(gid));
  if (!sheet) sheet = ss.getSheets()[0];

  sheet.appendRow([
    gid,
    data['2kg 박스'] || '',
    data['4kg 박스'] || '',
    data['주문자 이름'] || '',
    data['주문자 연락처'] || '',
    data['수령인 이름'] || '',
    data['수령인 연락처'] || '',
    data['우편번호'] || '',
    data['주소'] || '',
    data['수령 희망일'] || '',
    data['입금자명'] || '',
    data['가격'] || ''
  ]);
}

/**
 * 카카오 '나에게 보내기' 로 주문 내용을 전송한다.
 * 저장된 refresh_token 이 없으면 조용히 건너뛴다(시트 저장은 실패시키지 않음).
 */
function sendKakaoToMe(data) {
  const accessToken = getValidKakaoAccessToken();
  if (!accessToken) {
    console.warn('카카오 토큰이 없습니다. logKakaoAuthorizeUrl() 안내를 먼저 진행하세요.');
    return;
  }

  const text =
    '🍇 새 주문이 접수되었습니다\n' +
    `- 2kg 박스: ${data['2kg 박스'] || 0}개\n` +
    `- 4kg 박스: ${data['4kg 박스'] || 0}개\n` +
    `- 주문자: ${data['주문자 이름']} (${data['주문자 연락처']})\n` +
    `- 수령인: ${data['수령인 이름']} (${data['수령인 연락처']})\n` +
    `- 주소: [${data['우편번호']}] ${data['주소']}\n` +
    `- 수령 희망일: ${data['수령 희망일']}\n` +
    `- 입금자명: ${data['입금자명']}\n` +
    `- 가격: ${data['가격']}원`;

  const templateObject = {
    object_type: 'text',
    text: text,
    link: { web_url: '', mobile_web_url: '' }
  };

  UrlFetchApp.fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + accessToken },
    payload: { template_object: JSON.stringify(templateObject) },
    muteHttpExceptions: true
  });
}

/**
 * access_token 을 refresh_token 으로 갱신해서 반환한다.
 */
function getValidKakaoAccessToken() {
  const props = PropertiesService.getScriptProperties();
  const refreshToken = props.getProperty('KAKAO_REFRESH_TOKEN');
  if (!refreshToken) return null;

  const res = UrlFetchApp.fetch('https://kauth.kakao.com/oauth/token', {
    method: 'post',
    payload: {
      grant_type: 'refresh_token',
      client_id: KAKAO_REST_API_KEY,
      refresh_token: refreshToken
    },
    muteHttpExceptions: true
  });

  const result = JSON.parse(res.getContentText());
  if (result.access_token) {
    props.setProperty('KAKAO_ACCESS_TOKEN', result.access_token);
    if (result.refresh_token) {
      props.setProperty('KAKAO_REFRESH_TOKEN', result.refresh_token);
    }
    return result.access_token;
  }
  console.error('카카오 토큰 갱신 실패: ' + res.getContentText());
  return null;
}

/**
 * ===== 최초 1회만 실행하는 인증 절차 =====
 *
 * 1) 이 함수를 실행하면 로그(보기 > 실행 로그)에 인증 URL이 출력된다.
 *    그 URL을 브라우저에서 열어 카카오 로그인 후 동의한다.
 * 2) 로그인 후 redirect_uri(이 웹 앱 URL)로 리다이렉트되면서 ?code=... 가 붙는데,
 *    doGet(e) 가 이를 받아 자동으로 토큰을 저장한다.
 */
function logKakaoAuthorizeUrl() {
  const url =
    'https://kauth.kakao.com/oauth/authorize' +
    '?client_id=' + KAKAO_REST_API_KEY +
    '&redirect_uri=' + encodeURIComponent(KAKAO_REDIRECT_URI) +
    '&response_type=code' +
    '&scope=talk_message';
  Logger.log(url);
}

/**
 * 카카오 로그인 인증 후 리다이렉트되어 들어오는 code 를 받아 토큰을 발급/저장한다.
 */
function doGet(e) {
  const code = e.parameter.code;
  if (!code) {
    return HtmlService.createHtmlOutput('카카오 인증 코드가 없습니다.');
  }

  const res = UrlFetchApp.fetch('https://kauth.kakao.com/oauth/token', {
    method: 'post',
    payload: {
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code: code
    },
    muteHttpExceptions: true
  });

  const result = JSON.parse(res.getContentText());
  if (result.access_token) {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('KAKAO_ACCESS_TOKEN', result.access_token);
    props.setProperty('KAKAO_REFRESH_TOKEN', result.refresh_token);
    return HtmlService.createHtmlOutput('카카오 인증 완료! 이 탭은 닫으셔도 됩니다.');
  }
  return HtmlService.createHtmlOutput('인증 실패: ' + res.getContentText());
}