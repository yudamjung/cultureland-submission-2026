// 부모 브랜드(이마트,신세계상품권 · 롯데상품권 · SKT)가 가진 세부 권종.
// 설명은 카탈로그에서 확인된 내용만 담는다. 확인되지 않은 조건은 "미확인"으로 둔다.
// 권종마다 고유한 로고가 있으면 logo로 지정한다. 없으면 부모 브랜드 로고를 쓴다.
const CL = 'https://image.cultureland.co.kr/upload/web';

export const childrenByPlace = {
  shinsegae: [
    { id: 'kiosk', name: '모바일 교환권 (키오스크형)', tag: '모바일', logo: `${CL}/usecashService/logo_%EC%8B%A0%EC%84%B8%EA%B3%84%EC%83%81%ED%92%88%EA%B6%8C(%EB%AA%A8%EB%B0%94%EC%9D%BC%ED%82%A4%EC%98%A4%EC%8A%A4%ED%81%AC%ED%98%95).png`, summary: '신세계 모바일 교환권(키오스크형)이에요. 교환처 조건은 확인되지 않았어요.' },
    { id: 'paper', name: '지류 상품권 (배송상품)', tag: '지류·배송', logo: `${CL}/coupon/coupon_202511261008323951.png`, summary: '배송으로 받는 신세계 지류 상품권이에요. 배송 조건은 확인되지 않았어요.' },
    { id: 'emarticon', name: '이마트 e마티콘', tag: '모바일', logo: `${CL}/usecashService/logo_%EC%9D%B4%EB%A7%88%ED%8B%B0%EC%BD%98.png`, summary: '이마트·트레이더스 매장에서 바코드를 제시해 쓰는 잔액관리형 모바일 상품권(e마티콘)이에요.' },
  ],
  lotte: [
    { id: 'mobile', name: '모바일 교환권', tag: '모바일', logo: `${CL}/coupon/coupon_202511260322597701.png`, summary: '익일 발송되는 롯데 모바일 교환권이에요. 배송 지류상품권과는 다른 권종이에요.' },
    { id: 'paper', name: '지류 상품권 (배송상품)', tag: '지류·배송', logo: `${CL}/coupon/coupon_202511260136364101.png`, summary: '배송으로 받는 롯데 지류 상품권이에요. 모바일 교환권과는 다른 권종이에요.' },
  ],
  tdata: [
    { id: 'data', name: 'T 데이터쿠폰', tag: '데이터', summary: 'T world에 등록해서 써요. 대상 요금제와 등록기한은 구매권별로 확인하세요.' },
    { id: 'roaming', name: 'T 로밍쿠폰', tag: '로밍', summary: 'T world 로밍 메뉴에 등록해서 써요. SKT 고객 대상이에요. 등록기한은 구매권별로 확인하세요.' },
    { id: 'direct', name: 'T 다이렉트샵', tag: '온라인 결제', summary: '온라인 제품 결제 할인에 써요. 대리점 방문 사용은 불가해요.' },
  ],
};
