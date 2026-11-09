import { culturelandOriginalLogos } from './culturelandOriginalLogos.js';

const suppliedLogos = {
  artbox: 'svg', alpha: 'svg', talesrunner: 'svg', blackdesert: 'svg', metalslug: 'png', lastwar: 'png',
  geosang: 'png', smilegatepc: 'png', vfive: 'png', cheonsangbi: 'png', yapka: 'png', digimon: 'png',
  '37games': 'png', latale: 'png', starconflict: 'png', vegagames: 'gif', samgukji2: 'png', z9star: 'png',
  mixmaster: 'gif', darkeden: 'png', cabal: 'svg', mookhon: 'png', godius: 'png', joycity: 'png',
  nextmarket: 'png', naddic: 'png', hanbiton: 'png', redstone: 'png', dho: 'png',
  doonline: 'png', gnjoy: 'gif', rohan: 'svg', pizzamall: 'png', roun: 'png',
  bangung: 'png', jayeon: 'png', rimini: 'png', paymentwall: 'svg', tcash: 'png',
};
const darkLogoIds = new Set(['blackdesert', 'cheonsangbi', 'cabal', 'mookhon', 'joycity', 'nextmarket', 'hanbiton', 'rohan', 'pizzamall', 'roun', 'bangung', 'jayeon', 'rimini', 'paymentwall']);

// 조사 기준일 2026-11-08. status: confirmed=공식 상세 확인, partial=일반 사용법만 확인, listed=목록 등재만 확인.
const officialNames = {
  lastwar: '라스트 워:서바이벌', metalslug: '메탈슬러그:각성', nextmarket: 'NEXT Market', ncsoft: 'Play NC', riot: '리그오브레전드',
  psstore: 'PS Store', yes24: 'yes24', gln: 'G앱머니', welcome: '웰컴페이', cjone: 'CJ ONE', payco: '페이코',
  ssg: 'SSG PAY', lpoint: 'L.POINT', hpoint: 'H.Point', paybook: '페이북', apartment: '아파트아이', olive: '올리브영',
  shinsegae: '신세계모바일(키오스크형)', lotte: '롯데모바일교환권(지류교환형)', emart: '이마티콘', cjmarket: 'CJ 더마켓',
  ikea: 'IKEA', starbucks: '스타벅스', tdata: 'SK telecom', troaming: 'T로밍',
};
const game = [
  ['lastwar', '라스트워: 서바이벌', 'confirmed', 'UID 로그인 → 상품 선택 → Cultureland 결제. 실제 결제창은 확인하지 않았어요.', 'https://m.cultureland.co.kr/game/useGuide.do?gmsv=lastwar'],
  ['roblox', '로블록스', 'confirmed', '웹에서 Robux 선택 → 기타 → Culture Land 로고의 문화상품권. 기프트카드는 별도 경로예요.', 'https://m.cultureland.co.kr/game/useGuide.do?gmsv=roblox'],
  ['lordnine', '로드나인', 'partial', 'NEXT Market 상점에서 게임 계정으로 로그인한 뒤 상품 선택. 컬쳐랜드 결제창 조건은 미확인.', 'https://l9.nextmarket.games/shop'],
  ['gf2', '소녀전선2: 망명', 'confirmed', 'HAOPLAY 로그인·캐릭터 선택 → 더 보기 → Culture Land → 상품 결제.', 'https://m.cultureland.co.kr/game/useGuide.do?gmsv=gf2'],
  ['metalslug', '메탈슬러그: 각성', 'confirmed', 'HAOPLAY 로그인·캐릭터 선택 → 더 보기 → Culture Land → 루비·패키지 결제.', 'https://m.cultureland.co.kr/game/useGuide.do?gmsv=msawk'],
  ['horizon', '호라이즌 워커', 'partial', 'NEXT Market의 게임별 상점. 로그인 뒤 결제수단명·수수료·한도는 미확인.', 'https://horizonwalker.nextmarket.games/shop'],
  ['nexon', '넥슨', 'partial', '넥슨캐시 충전의 컬쳐랜드상품권은 16자리 PIN 수단. 18자리 문화상품권과 구분하세요.', 'https://asgard.nexon.com/News/notice/139837'],
  ['steam', '스팀', 'partial', '게임 구매·지갑 충전에서 문화상품권 선택 → Degica 결제. 현재 금액·수수료는 결제창 확인이 필요해요.', 'https://help.steampowered.com/ko/faqs/view/78E3-7431-1E88-AD59'],
  ['nextmarket', '넥스트마켓', 'listed', '게임별 웹 상점 경로만 확인. 모든 게임의 컬쳐랜드 결제 지원은 미확인.', 'https://www.nextmarket.games/'],
  ['stove', '스토브', 'partial', '스토브캐시 충전 → 일반결제 → 컬쳐랜드상품권. 1회 1천~10만원은 2025년 FAQ 기준.', 'https://www.onstove.com/'],
  ['ncsoft', '엔씨소프트', 'partial', '퍼플 스토어에서 컬쳐랜드상품권은 코인 충전 전용이며 상품 직접결제에는 쓸 수 없어요.', 'https://lounge.plaync.com/feed/49243?country=KR&locale=ko-KR'],
  ['netmarble', '넷마블', 'partial', '공식 공지의 결제수단명은 컬쳐랜드 상품권. 현재 충전 화면·수수료·한도는 미확인.', 'https://notice.netmarble.net/main/BbsContentView.asp?seq=13267811'],
  ['hangame', '한게임', 'partial', '직접 충전과 한게임상품권 쿠폰 구매는 별도 경로. 직접 결제 세부 조건은 미확인.', 'https://m.hangame.com/'],
  ['pmang', '피망', 'partial', '2013년 공지는 스마트문상 카드 사용법이며 현재 컬쳐캐쉬 결제 지원 근거가 아니에요.', 'https://www.pmang.com/notice/view/3233'],
  ['webzen', '웹젠', 'listed', '2014년 R2 공지에는 문화상품권 절차가 있지만 현재 지원 여부는 미확인.', 'https://r2.webzen.co.kr/news/notices/detail/1439?page=286'],
  ['wemade', '위메이드', 'listed', '게임 소개 목록만 확인. 게임별 컬쳐랜드 결제 경로와 지원 여부는 미확인.', 'https://wemade.com/kr/games'],
  ['blizzard', '블리자드', 'partial', '컬쳐캐쉬 충전 후 블리자드 결제에서 컬쳐랜드상품권을 선택하세요. 게임별 범위는 미확인.', 'https://us.battle.net/support/ko/'],
  ['riot', '라이엇게임즈', 'partial', 'LoL은 상품권류 → 문화상품권 → 컬쳐랜드 로그인·컬쳐캐쉬 결제. 다른 게임은 별도 확인.', 'https://support.riotgames.com/ko-kr/league-of-legends/billing/문화상품권-결제-faq'],
  ['psstore', 'PS Store 기프트카드', 'partial', '컬쳐캐쉬로 코드를 산 뒤 PlayStation Store에서 12자리 코드를 등록해요. 판매권 조건은 미확인.', 'https://m.cultureland.co.kr/cpn/cpnApp.do?cpgm=sony', { type: 'coupon' }],
  ['googleplay', 'Google Play 기프트 코드', 'confirmed', '컬쳐캐쉬로 코드를 산 뒤 Play 스토어 또는 play.google.com/redeem에서 등록해요.', 'https://www.cultureland.co.kr/google/googleBuy.do', { type: 'coupon' }],
];

const direct = [
  ['cgv', 'CGV', 'confirmed', '온라인 예매는 컬쳐캐쉬 결제. 별도 CGV 기프트카드 쿠폰 구매도 가능해요.', 'https://www.cultureland.co.kr/usecash/useCash.do', { cat: '문화생활', variants: '바로사용 / CGV 기프트카드 쿠폰', offline: 'yes' }],
  ['bunjang', '번개장터', 'confirmed', '결제 단계에서 컬쳐캐쉬 조회·사용. 공식 FAQ 기준 컬쳐캐쉬 결제액의 5% 수수료.', 'https://www.cultureland.co.kr/usecash/useCash.do', { fee: '5% 수수료' }],
  ['yes24', '예스24', 'confirmed', '로그인 주문의 외부 상품권/포인트에서 컬쳐랜드상품권(컬쳐캐쉬) 선택. 10원 단위.', 'https://www.cultureland.co.kr/usecash/useCash.do'],
  ['culturemall', '컬쳐몰', 'confirmed', '컬쳐몰 상품을 선택하고 결제 단계에서 컬쳐캐쉬를 사용해요.', 'https://www.cultureland.co.kr/usecash/useCash.do'],
  ['gsshop', 'GS SHOP', 'confirmed', '컬쳐랜드 바로사용 경유 → 주문 결제에서 컬쳐캐쉬 선택. 로그인 주문만 가능.', 'https://www.cultureland.co.kr/usecash/useCash.do'],
  ['ridi', '리디북스', 'confirmed', '리디 웹에서 작품 구매 또는 리디캐시 충전 시 컬쳐랜드 문화상품권 선택.', 'https://www.cultureland.co.kr/usecash/useCash.do', { cat: '콘텐츠' }],
  ['db', 'DB손해보험', 'confirmed', '컬쳐랜드 경유로 보험료를 조회한 경우에만 컬쳐캐쉬 결제 가능.', 'https://www.cultureland.co.kr/usecash/useCash.do', { cat: '금융', limit: '증권당 30만원' }],
  ['lottecinema', '롯데시네마', 'confirmed', '영화 예매 결제에서 컬쳐캐쉬 선택. 비회원 주문은 불가.', 'https://www.cultureland.co.kr/usecash/useCash.do', { cat: '문화생활', offline: 'yes' }],
  ['aladin', '알라딘', 'confirmed', '주문 결제에서 컬쳐캐쉬 선택. 10원 단위, 비회원 주문은 불가.', 'https://www.cultureland.co.kr/usecash/useCash.do', { offline: 'yes' }],
  ['kyobo', '교보문고', 'confirmed', '온라인 주문 결제에서 컬쳐캐쉬 선택. 오프라인 바코드 경로도 있어요.', 'https://www.cultureland.co.kr/usecash/useCash.do', { offline: 'yes' }],
  ['megabox', '메가박스', 'confirmed', '온라인 영화 예매에서 컬쳐캐쉬 선택. 오프라인 바코드 경로도 있어요.', 'https://www.cultureland.co.kr/usecash/useCash.do', { cat: '문화생활', offline: 'yes' }],
  ['kakaopage', '카카오페이지', 'confirmed', '콘텐츠 충전·구매의 컬쳐캐쉬 결제수단 이용. 화면 명칭은 로그인 뒤 확인.', 'https://www.cultureland.co.kr/usecash/useCash.do', { cat: '콘텐츠' }],
  ['hmall', '현대Hmall', 'confirmed', '컬쳐랜드 바로사용 경유 → 로그인 주문 결제에서 컬쳐캐쉬 선택.', 'https://www.cultureland.co.kr/usecash/useCash.do', { limit: '계정당 월 50만원' }],
  ['lotteshop', '롯데홈쇼핑', 'confirmed', '컬쳐랜드 경유 주문에서 컬쳐캐쉬 선택. 한도 초과분 복합결제는 불가.', 'https://www.cultureland.co.kr/usecash/useCash.do', { limit: 'ID당 월 100만원' }],
  ['daiso', '다이소', 'confirmed', '컬쳐랜드가 연결하는 온라인 구매 경로. 오프라인 매장 결제 근거는 아니에요.', 'https://www.cultureland.co.kr/usecash/useCash.do'],
];

const convert = [
  ['coupang', '쿠팡캐시', 'confirmed', '컬쳐캐쉬에서 6% 차감. 최소 1천원·100원 단위, 월 50만원(수수료 제외).', 'https://www.cultureland.co.kr/conversion/coupang_bridge.do', { fee: '6% 차감' }],
  ['otocash', '오투캐시', 'partial', '섹타나인 오투포인트 가맹점에서 사용. 컬쳐랜드 전환 수수료·한도는 미확인.', 'https://www.o2point.co.kr/help.html'],
  ['npay', 'Npay 포인트', 'confirmed', '6% 차감, 최소 1천원. 적립 포인트로 전환되며 취소·현금인출 불가.', 'https://www.cultureland.co.kr/conversion/naverpay_bridge.do', { fee: '6% 차감' }],
  ['gln', 'G앱머니(해외결제)', 'confirmed', '8% 차감, 최소 1천원·1천원 단위. 해외결제 범위는 GLN 정책 확인.', 'https://www.cultureland.co.kr/conversion/gln_bridge.do', { fee: '8% 차감' }],
  ['welcome', '웰컴머니', 'partial', '웰컴페이 제휴처·제로페이 가맹점에서 사용. 전환 수수료·한도는 미확인.', 'https://play.google.com/store/apps/details?id=com.welcomepayments.welcomepay'],
  ['dalpoint', '달포인트', 'partial', '컬쳐랜드 공식 이미지에 달콘 앱에서 포인트 충전 → 컬쳐랜드 조회 → 결제금액 확인·결제 → 달포인트 사용 절차가 안내돼요. 잔여 포인트 환불 신청 화면도 포함돼요. 현재 수수료·한도·환불 조건은 전환 화면에서 확인하세요.', 'https://image.cultureland.co.kr/upload/editor/202512111754501857.png', { guideImage: 'https://image.cultureland.co.kr/upload/editor/202512111754501857.png', checkedAt: '2026-11-10' }],
  ['cjone', 'CJ ONE 포인트', 'confirmed', '공식 제휴 안내 기준 수수료 5%, 1천P 단위, 월 최대 200만P.', 'https://www.cjone.com/cjmweb/point-card/brand/detail.do?brnd_cd=0394&coopco_cd=7000&mcht_no=0394', { fee: '5% 수수료' }],
  ['payco', 'PAYCO', 'confirmed', '6% 별도 부과. 적립포인트로 전환, 취소·계좌환불·재전환 불가.', 'https://www.cultureland.co.kr/conversion/payco_bridge.do', { fee: '6% 별도' }],
  ['ssg', 'SSG MONEY', 'confirmed', '5% 별도 부과. 신세계 계열 등 SSG MONEY 가맹점에서 사용.', 'https://www.cultureland.co.kr/conversion/ssgpay_bridge.do', { fee: '5% 별도' }],
  ['smilemoney', '스마일머니', 'confirmed', '5% 별도 부과. 미사용 전환 취소는 컬쳐랜드 고객센터에 문의.', 'https://www.cultureland.co.kr/conversion/smilecash_bridge.do', { fee: '5% 별도' }],
  ['happypoint', '해피포인트', 'confirmed', '4.5% 별도 부과, 1천원 단위. 전환 취소 불가.', 'https://www.cultureland.co.kr/conversion/happyPoint_bridge.do', { fee: '4.5% 별도' }],
  ['11pay', '11pay point', 'confirmed', '6% 별도 부과, 최소 1천원·100원 단위. 전환 취소 불가.', 'https://www.cultureland.co.kr/conversion/skpaypoint_bridge.do', { fee: '6% 별도' }],
  ['lpoint', 'LPOINT', 'confirmed', '6% 별도 부과, 최소 1천원·100원 단위. 전환 취소 불가.', 'https://www.cultureland.co.kr/conversion/lpoint_bridge.do', { fee: '6% 별도' }],
  ['hpoint', 'Hpoint', 'confirmed', '6% 별도 부과, 최소 100원·100원 단위. 유효기간 5년.', 'https://www.cultureland.co.kr/conversion/hpoint_bridge.do', { fee: '6% 별도' }],
  ['mobilcard', '모빌카드', 'partial', '모빌카드에서는 컬쳐캐쉬 충전 경로 확인. 현재 전환 수수료·한도는 미확인.', 'https://www.mobilcard.co.kr/web/faq/list'],
  ['paybook', '페이북머니', 'partial', '2024년 공식 공지 한도는 일 20만원·월 50만원. 현재 수수료율은 공식 미확인.', 'https://m.cultureland.co.kr/tgl/noticeBoard.do?NoteID=2214'],
  ['apartment', '아파트캐시', 'partial', '관리비 결제용 캐시. 전환 신청 후 취소 불가, 유효기간 12개월(2026년 약관).', 'https://www.apti.co.kr/agreeMent/20260430/terms/u_termsCon_web.asp'],
];

const coupon = [
  ['olive', '올리브영 기프트카드', '쇼핑', 'CJ ONE 바우처형인지 카드번호형인지에 따라 등록 경로가 달라요.', 'olivem2'],
  ['tiktok', '틱톡 기프트카드', '콘텐츠', '기프트카드 PIN을 TikTok 코인 교환 페이지에서 등록. 한국 이용 조건 확인 필요.', 'tiktok'],
  ['shinsegae', '신세계 상품권', '쇼핑', '모바일 키오스크형 2종과 배송 지류형 1종. 권종별 교환처·배송 조건은 미확인.', 'sgckiosk3', { variants: '신세계모바일(키오스크형) / 신세계상품권(KIOSK) / 신세계지류상품권' }],
  ['lotte', '롯데 상품권', '쇼핑', '익일발송 모바일교환권과 배송 지류상품권은 서로 다른 권종이에요.', 'lotte1', { variants: '[익일발송] 롯데모바일교환권 / 롯데지류상품권(배송상품)' }],
  ['soop', 'SOOP 별풍선', '콘텐츠', '받은 별풍선상품권의 코드번호·비밀번호를 SOOP에 등록해요.', 'soop2'],
  ['webtoon', '네이버웹툰', '콘텐츠', '교환권이면 PIN으로 먼저 교환한 뒤 웹·안드로이드 쿠키샵에 등록. iOS 앱 등록 불가.', 'naver'],
  ['emart', '이마트 모바일 금액권', '쇼핑', '이마트·트레이더스 매장에서 바코드 제시. 잔액관리형이며 지류 교환은 불필요.', 'ssgemart2', { offline: 'yes' }],
  ['cjgift', 'CJ기프트카드', '쇼핑', 'CJ ONE에 등록하거나 바우처 전환. 카드 유형별 사용 가능 브랜드가 달라요.', 'cjgift'],
  ['cjmarket', 'CJ더마켓', '쇼핑', 'CJ더마켓 기프트카드를 등록한 뒤 지정 사용처에서 결제해요.', 'cjthem'],
  ['cjfood', 'CJ푸드빌', '외식', 'CJ ONE 등록·전환 후 해당 카드의 지정 브랜드·매장에서 사용해요.', 'Cjfood'],
  ['smilegift', '스마일기프트', '외식', '제휴 오프라인 매장에서 모바일쿠폰을 제시해요. 잔액은 다음에 사용 가능.', 'smile', { offline: 'yes' }],
  ['ikea', 'IKEA 기프트 카드', '쇼핑', '디지털 카드 QR을 IKEA 매장 계산대에 제시해요. 온라인몰 사용은 별도 확인.', 'ikea', { offline: 'yes' }],
  ['disney', '디즈니플러스', '콘텐츠', '한국 구독권 일반 등록은 문자 링크를 통한 웹 등록. 컬쳐랜드 판매권의 기간·형태는 미확인.', 'disney'],
  ['starbucks', '스타벅스 e카드 교환권', '외식', '교환권은 직접 결제수단이 아니에요. 스타벅스 앱 카드 교환권 메뉴에 등록 후 사용.', 'starb', { offline: 'yes' }],
  ['ediya', '이디야커피', '외식', '권종에 따라 매장 쿠폰 제시 또는 멤버스 앱 카드 등록. 컬쳐랜드권 형태는 미확인.', 'EDIYA', { offline: 'yes' }],
  ['tdata', 'T데이터쿠폰', '콘텐츠', 'T world에서 쿠폰을 등록해요. 대상 요금제와 등록기한은 구매권별 확인.', 'skdata'],
  ['troaming', 'T로밍쿠폰', '콘텐츠', 'T world 로밍 쿠폰 메뉴에서 등록. SKT 고객 대상.', 'baro'],
  ['tdirect', 'T다이렉트샵', '쇼핑', '온라인 제품 결제의 포인트·이용권 할인에서 등록·적용. 대리점 방문 사용 불가.', 'tdirect'],
  ['yogurt', '요거프레소', '외식', '해당 브랜드 이용 가능 매장에서 쿠폰 제시. 개별권 조건은 미확인.', 'ygp', { offline: 'yes' }],
  ['jaws', '죠스떡볶이', '외식', '해당 브랜드 이용 가능 매장에서 쿠폰 제시. 배달 가능 여부는 미확인.', 'JAWS', { offline: 'yes' }],
  ['theborn', '더본코리아', '외식', '통합권이라면 대상 브랜드 매장에서 쿠폰 제시. 제외 매장 확인 필요.', 'theborn', { offline: 'yes' }],
  ['hongroo', '홍루이젠', '외식', '해당 브랜드 이용 가능 매장에서 쿠폰 제시. 개별권 잔액 조건은 미확인.', 'hong', { offline: 'yes' }],
  ['kgc', '정관장', '쇼핑', '권종에 적힌 사용 가능 매장에서 제시. 백화점·마트 등 일부 제외 가능.', 'kgc', { offline: 'yes' }],
];

const offline = [
  ['cu', 'CU', '쇼핑'], ['gs25', 'GS25', '쇼핑'], ['seveneleven', '7-Eleven', '쇼핑'], ['emart24', 'emart24', '쇼핑'],
  ['artbox', 'ARTBOX', '쇼핑'], ['hottracks', 'HOTTRACKS', '쇼핑'],
  ['phoenixpyeongchang', 'phoenix pyeongchang', '문화생활'], ['phoenixseopjikoji', 'phoenix seopjikoji', '문화생활'],
  ['ashley', 'ASHLEY', '외식'], ['ashleyqueens', 'ASHLEY QUEENS', '외식'], ['pizzamall', 'Pizza Mall', '외식'],
  ['jayeon', '자연별곡', '외식'], ['bangung', '반궁', '외식'], ['roun', '로운 샤브샤브', '외식'],
  ['rimini', 'RIMINI', '외식'], ['tero', 'TERO', '외식'], ['foodempire', 'Food Empire', '외식'],
  ['xingkai', 'XINGKAI', '외식'], ['kisara', 'KISARA', '외식'], ['dalkomm', 'Dal.Komm', '외식'],
  ['beansbins', 'BEANSBINS COFFEE', '외식'], ['newyorkburger', 'NEW YORK BURGER', '외식'], ['alpha', 'Alpha', '쇼핑'],
];

// 2026-11-09 원본 사용처 페이지의 154개 카드(6페이지)를 전수 대조해 기존 통합 목록에 없는 항목만 추가했다.
const discovered = [
  ['tncash', '틴캐시', '콘텐츠', 'coupon', 'https://image.cultureland.co.kr/upload/web/usecashService/202607020915256248.png'],
  ['kakaoemoticon', '카카오이모티콘', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/logo_카카오이모티콘.png'],
  ['howlpot', '하울팟', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/logo_하울팟.png'],
  ['santapond', '산타의 연못', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/logo_산타의연못.png'],
  ['overwatch', '오버워치', '게임', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/logo_오버워치.png'],
  ['itemmania', '아이템매니아', '게임', 'direct'], ['toonations', '투네이션', '콘텐츠', 'direct'],
  ['ffxiv', '파이널판타지14', '게임', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/logo_파이널판타지.png'],
  ['crack', '크랙', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/logo_크랙.png'],
  ['lezhin', '레진코믹스', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/logo_레진코믹스.png'],
  ['itembay', '아이템베이', '게임', 'direct'], ['galaxystore', '갤럭시스토어', '콘텐츠', 'direct'],
  ['onestore', '원스토어', '콘텐츠', 'direct'], ['geosang', '거상', '게임', 'direct'],
  ['juneinter', '준인터', '게임', 'direct'], ['masangsoft', '마상소프트', '게임', 'direct'],
  ['talesrunner', '테일즈런너', '게임', 'direct'], ['blackdesert', '검은 사막', '게임', 'direct'],
  ['smilegatepc', '스마일게이트PC방', '게임', 'direct'], ['pokipoki', '포키포키', '게임', 'direct'],
  ['winjoy', '윈조이게임', '게임', 'direct'], ['vfive', '브이파이브게임즈', '게임', 'direct'],
  ['cheonsangbi', '천상비', '게임', 'direct'], ['yapka', '얍카', '게임', 'direct'],
  ['adventurer', '승부사 온라인', '게임', 'direct'], ['digimon', '디지몬 슈퍼럼블', '게임', 'direct'],
  ['37games', '37games', '게임', 'direct'], ['itemthanks', '아이템땡스', '게임', 'direct'],
  ['vfun', 'vfun', '게임', 'direct'], ['latale', '라테일', '게임', 'direct'],
  ['mir2', '미르의전설2', '게임', 'direct'], ['mir3', '미르의전설3', '게임', 'direct'],
  ['starconflict', 'Star Conflict', '게임', 'direct'], ['maplestory', '메이플스토리', '게임', 'direct'],
  ['vegagames', '베가게임즈', '게임', 'direct'], ['samgukji2', '온라인삼국지2', '게임', 'direct'],
  ['z9star', '내 맘대로 Z9별', '게임', 'direct'], ['mixmaster', '믹스마스터', '게임', 'direct'],
  ['darkeden', '다크에덴', '게임', 'direct'], ['cabal', '카발온라인', '게임', 'direct'],
  ['mookhon', '묵혼', '게임', 'direct'], ['godius', 'GODIUS', '게임', 'direct'],
  ['joycity', '조이시티', '게임', 'direct'], ['daumgame', 'Daum 게임', '게임', 'direct'],
  ['linegames', '라인게임즈', '게임', 'direct'], ['naddic', '나딕게임즈', '게임', 'direct'],
  ['hanbiton', '한빛온', '게임', 'direct'], ['redstone', '붉은보석', '게임', 'direct'],
  ['dho', '대항해시대', '게임', 'direct'], ['worldoftanks', '월드오브탱크', '게임', 'direct'],
  ['doonline', '디오', '게임', 'direct'], ['gnjoy', 'GNJOY', '게임', 'direct'], ['rohan', '로한', '게임', 'direct'],
  ['crepe', '크레페', '콘텐츠', 'direct'], ['sharebox', '쉐어박스', '콘텐츠', 'direct'],
  ['onestory', '원스토리', '콘텐츠', 'direct'], ['fanding', '팬딩', '콘텐츠', 'direct'],
  ['popkontv', '팝콘티비', '콘텐츠', 'direct'], ['netfile', '넷파일', '콘텐츠', 'direct'],
  ['ssadafile', '싸다파일', '콘텐츠', 'direct'], ['filecity', '파일시티', '콘텐츠', 'direct'],
  ['ondisk', '온디스크', '콘텐츠', 'direct'], ['wedisk', '위디스크', '콘텐츠', 'direct'],
  ['pdpop', '피디팝', '콘텐츠', 'direct'], ['mgame', '엠게임', '게임', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/202607020914206247.png'],
  ['bugsmusic', '벅스뮤직', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/logo_벅스뮤직.png'],
  ['pandalive', '판다라이브', '콘텐츠', 'direct'],
  ['fitcollabo', '핏콜라보', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/202607020915536248.png'],
  ['yesfile', '예스파일', '콘텐츠', 'direct'], ['spoonradio', '스푼라디오', '콘텐츠', 'direct'],
  ['filejo', '파일조', '콘텐츠', 'direct'],
  ['bomtoon', '봄툰', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/202607020914016247.png'],
  ['munpia', '문피아', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/202607020913026246.png'],
  ['toptoon', '탑툰', '콘텐츠', 'direct'], ['idfarm', '아이디팜', '게임', 'direct'],
  ['mrblue', '미스터블루', '콘텐츠', 'direct', 'https://image.cultureland.co.kr/upload/web/usecashService/202607020913416246.png'],
  ['filesun', '파일썬', '콘텐츠', 'direct'], ['smatouch', '스마터치', '콘텐츠', 'direct'],
  ['paymentwall', '페이먼트월', '콘텐츠', 'direct'], ['tcash', '티캐시', '콘텐츠', 'direct'],
];

const make = (id, name, cat, type, status, summary, sourceUrl, extra = {}) => {
  const officialName = officialNames[id] || name;
  return {
    id, name: officialName, cat, type, status, summary, sourceUrl, ...extra,
    initial: officialName.slice(0, 2), logo: suppliedLogos[id] ? `/assets/logos/brand-${id}.${suppliedLogos[id]}` : extra.logo || culturelandOriginalLogos[id] || `/assets/logos/${id}.svg`, logoOnDark: darkLogoIds.has(id), checkedAt: extra.checkedAt || '2026-11-09',
  };
};

export const catalog = [
  ...game.map(([id, name, status, summary, sourceUrl, extra]) => make(id, name, '게임', 'direct', status, summary, sourceUrl, extra)),
  ...direct.map(([id, name, status, summary, sourceUrl, extra]) => make(id, name, '쇼핑', 'direct', status, summary, sourceUrl, extra)),
  ...convert.map(([id, name, status, summary, sourceUrl, extra]) => make(id, name, '금융', 'convert', status, summary, sourceUrl, extra)),
  ...coupon.map(([id, name, cat, summary, code, extra]) => make(id, name, cat, 'coupon', 'partial', summary, `https://m.cultureland.co.kr/cpn/cpnApp.do?cpgm=${code}`, extra)),
  ...discovered.map(([id, name, cat, type, logo]) => make(id, name, cat, type, 'partial', '컬쳐랜드 원본 사용처 목록에서 확인했어요. 세부 결제 조건은 실제 이용 전에 원문 안내를 확인하세요.', 'https://www.cultureland.co.kr/usecash/useCash.do', { logo: logo || '/assets/logos/unknown.svg' })),
  ...offline.map(([id, name, cat]) => make(id, name, cat, 'store', 'partial', '컬쳐랜드상품권 바코드 또는 컬쳐랜드 앱 바코드 결제 경로. 브랜드별 제외 매장은 방문 전 확인하세요.', 'https://www.cultureland.co.kr/voucher/voucheruse.do', { offline: 'yes' })),
];

export const offlineIds = ['cgv', 'lottecinema', 'megabox', 'kyobo', 'aladin', ...offline.map(([id]) => id)];
