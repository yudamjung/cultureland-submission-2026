import { getSteps } from '../data';
import { URLS } from './constants';

export const yesSteps = [
  { title: '교환하기', lines: ['선물함에서 ‘등록하기’를 누르면 12자리 번호가 복사돼요.', '컬쳐랜드에 로그인한 뒤 위쪽 ‘교환소’ 탭에 붙여넣고 교환하세요.', '교환하면 16자리 상품권 번호가 도착해요.'], button: '교환소 열기', href: URLS.cultureland },
  { title: '컬쳐캐쉬로 충전하기', lines: ['도착한 컬쳐랜드상품권을 컬쳐캐쉬로 충전해요.'], why: '온라인 쇼핑몰은 상품권이 아니라 컬쳐캐쉬로만 결제돼요.', button: '충전 화면 열기', href: URLS.cultureland },
  { title: '사용 가능 금액 확인하기', lines: ['컬쳐랜드 앱에서 ‘사용 가능 금액’을 확인해요.', '0원이면 아직 충전 전이에요.', '안심금고에 보관된 금액은 컬쳐랜드에서 찾은 뒤 써야 해요.'], button: '사용 가능 금액 보기', href: URLS.cultureland },
  { title: '예스24 결제창에서 선택하기', lines: ['“외부 상품권/포인트 → 컬쳐랜드상품권(컬쳐캐쉬)”을 누르고 컬쳐랜드에 로그인해요.', '‘문화상품권’ 버튼이 아니에요.', '예스24에 로그인한 주문만 가능하고, 모자란 금액은 카드로 함께 결제할 수 있어요.'], button: '예스24로 가기', href: URLS.yes24 },
];

export function guideSteps(place, holding) {
  if (place.id === 'yes24') return yesSteps;
  return getSteps(place, holding).map((step) => {
    if (step === '교환') return { title: '상품권 교환하기', lines: ['받은 12자리 교환권은 컬쳐랜드 교환소에서 상품권으로 교환해요.'], button: '컬쳐랜드 교환소 열기', href: URLS.cultureland };
    if (step === '충전') return { title: '컬쳐캐쉬로 충전하기', lines: ['16자리 컬쳐랜드상품권을 사용 가능 컬쳐캐쉬로 충전해요.', '안심금고에 보관된 잔액은 먼저 찾아야 해요.'], button: '컬쳐랜드 열기', href: URLS.cultureland };
    if (step === '앱 바코드 열기') return { title: '앱 바코드 열기', lines: ['컬쳐랜드 앱에 로그인한 뒤 홈 화면의 바코드결제에서 사용처를 선택해요.'], button: '공식 안내 보기', href: 'https://www.cultureland.co.kr/customer/help/serviceHelp.do?class1=2&class2=7' };
    if (step === '바코드 보여 주기' || step === '매장에서 보여 주기') return { title: '매장에서 바코드 보여 주기', lines: ['결제 전 상품권 또는 앱 바코드의 사용 가능 잔액을 확인해요.', '매장 직원에게 바코드를 보여 주세요. 일부 매장은 제외될 수 있어요.'], button: '공식 사용처 보기', href: 'https://www.cultureland.co.kr/voucher/voucheruse.do' };
    return { title: step === '포인트로 전환' ? '포인트로 전환하기' : step === '쿠폰 구매' ? '쿠폰 구매하기' : step === '쿠폰 등록' ? '쿠폰 등록·제시하기' : '결제창에서 선택하기', lines: [place.summary, ...(place.status === 'partial' ? ['세부 조건은 연결된 안내와 실제 화면에서 다시 확인하세요.'] : [])], button: '원문 안내 확인', href: place.sourceUrl };
  });
}
