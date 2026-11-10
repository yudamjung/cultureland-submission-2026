// 컬쳐랜드 홈페이지 "인기 사용처" 섹션(2026-11-09 피그마 보드 13-59 "PCver. - 인기 사용처 확인"에서 확인).
// 카테고리 순서와 57개 항목은 보드 구성 그대로. label은 카탈로그 표시명(IA 개편 2026-11-11)과
// 같게 유지한다. 보드 표기와 다른 이름은 쿠팡(보드)→쿠팡캐시 한 건뿐이다.
// id는 src/catalog.js의 카탈로그 항목과 연결한다.
// 순위는 없다. 홈페이지 방식대로 탭을 누르면 같은 자리에서 그리드만 바뀐다.
export const POPULAR_TABS = ['쇼핑', '게임', '콘텐츠', '금융', '외식', '문화생활'];

export const POPULAR = {
  '쇼핑': [
    { id: 'olive', label: '올리브영' },
    { id: 'coupang', label: '쿠팡' },
    { id: 'npay', label: '네이버페이' },
    { id: 'ssg', label: 'SSG페이' },
    { id: '11pay', label: '11pay' },
    { id: 'daiso', label: '다이소' },
    { id: 'cjgift', label: 'CJ 기프트카드' },
    { id: 'gsshop', label: 'GS SHOP' },
    { id: 'culturemall', label: 'Cmall' },
    { id: 'bunjang', label: '번개장터' },
  ],
  '게임': [
    { id: 'nexon', label: '넥슨' },
    { id: 'ncsoft', label: 'Play NC' },
    { id: 'steam', label: '스팀' },
    { id: 'netmarble', label: '넷마블' },
    { id: 'hangame', label: '한게임' },
    { id: 'webzen', label: '웹젠' },
    { id: 'riot', label: '리그오브레전드' },
    { id: 'blizzard', label: '블리자드' },
    { id: 'overwatch', label: '오버워치' },
    { id: 'roblox', label: '로블록스' },
  ],
  '콘텐츠': [
    { id: 'soop', label: 'SOOP' },
    { id: 'ridi', label: 'RIDI' },
    { id: 'crack', label: '크랙' },
    { id: 'webtoon', label: '네이버웹툰' },
    { id: 'kakaopage', label: '카카오페이지' },
    { id: 'bomtoon', label: '봄툰' },
    { id: 'lezhin', label: '레진코믹스' },
    { id: 'munpia', label: 'Munpia' },
    { id: 'disney', label: '디즈니플러스' },
    { id: 'kakaoemoticon', label: '카카오이모티콘' },
  ],
  '금융': [
    { id: 'dalpoint', label: 'DALCON' },
    { id: 'gln', label: 'GLN' },
    { id: 'smilemoney', label: '스마일머니' },
    { id: 'payco', label: 'PAYCO' },
    { id: 'lpoint', label: 'L.POINT' },
    { id: 'hpoint', label: 'H.Point' },
    { id: 'db', label: 'DB손해보험' },
    { id: 'paybook', label: '페이북' },
    { id: 'welcome', label: '웰컴페이' },
    { id: 'apartment', label: '아파트아이' },
  ],
  '외식': [
    { id: 'happypoint', label: '해피포인트' },
    { id: 'theborn', label: '더본' },
    { id: 'ediya', label: '이디야' },
    { id: 'cjmarket', label: 'CJ더마켓' },
    { id: 'cjfood', label: 'CJ푸드빌' },
    { id: 'smilegift', label: '스마일기프트' },
    { id: 'jaws', label: '죠스떡볶이' },
    { id: 'yogurt', label: '요거프레소' },
    { id: 'hongroo', label: '홍루이젠' },
    { id: 'starbucks', label: '스타벅스' },
  ],
  '문화생활': [
    { id: 'aladin', label: '알라딘' },
    { id: 'yes24', label: 'yes24' },
    { id: 'kyobo', label: '교보문고' },
    { id: 'cgv', label: 'CGV' },
    { id: 'lottecinema', label: '롯데시네마' },
    { id: 'megabox', label: '메가박스' },
    { id: 'bugsmusic', label: '벅스뮤직' },
  ],
};
