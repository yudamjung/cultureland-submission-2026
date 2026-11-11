import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { chargesFee, DEFAULT_MAX_QTY, feePercent, getCoupon, hasMethodChoice, itemAmount, itemTitle } from '../coupons';
import { findPlace } from '../data';
import { useGoBack } from '../hooks/useNav';
import { infoPath, placePath } from '../lib/paths';

const won = (value) => `${value.toLocaleString('ko-KR')}원`;
const manwon = (value) => (value % 10000 === 0 ? `${value / 10000}만원` : won(value));

// 금액권을 금액별로 골라 수량을 정하는 구매 화면. 결제는 컬쳐랜드 페이지에서 진행된다.
export default function CouponPage() {
  const { id, typeId } = useParams();
  const place = findPlace(id, typeId);
  if (!place || place.children?.length) return <Navigate to={typeId ? `/place/${id}/types` : `/place/${id}`} replace />;
  const product = getCoupon(place);
  if (!product) return <Navigate to={placePath(place)} replace />;
  return <Store key={`${place.id}-${place.typeId || ''}`} place={place} product={product} />;
}

function Store({ place, product }) {
  const goBack = useGoBack(hasMethodChoice(place) ? `${infoPath(place)}?pay=coupon` : infoPath(place));
  const [qty, setQty] = useState({});

  const rows = product.items.map((item, index) => ({ item, index, amount: itemAmount(item), count: qty[index] || 0 }));
  const count = rows.reduce((sum, row) => sum + row.count, 0);
  const total = rows.reduce((sum, row) => sum + row.amount * row.count, 0);
  const faceTotal = rows.reduce((sum, row) => sum + (row.item.face || 0) * row.count, 0);
  // 한 장 더 담아도 되는지. 한 번에 최대 장수(maxQty)가 있으면 그게 우선이고,
  // 아니면 일 구매 한도가 있는 액면가 상품은 한도 안에서 얼마든지, 그 밖에는 기본 상한을 쓴다.
  const blockedByLimit = (row) => !!product.dailyLimit && !!row.item.face && faceTotal + row.item.face > product.dailyLimit;
  const canAdd = (row) => {
    if (blockedByLimit(row)) return false;
    if (product.maxQty) return row.count < product.maxQty;
    return product.dailyLimit && row.item.face ? true : row.count < DEFAULT_MAX_QTY;
  };
  const limitHit = rows.some((row) => blockedByLimit(row));
  const change = (index, delta) => setQty((current) => {
    const row = rows[index];
    if (delta > 0 && !canAdd(row)) return current;
    return { ...current, [index]: Math.max(0, (current[index] || 0) + delta) };
  });

  const fee = chargesFee(product);
  const feeChip = product.cashback ? `구매 시 ${product.cashback * 100}% 캐쉬백`
    : product.feeWaived ? '수수료 지원 중'
    : fee ? `수수료 ${feePercent(product)}%`
    : '수수료 없음';
  const facts = [
    product.validity && ['유효기간', product.validity],
    product.dailyLimit && ['일 구매 한도', manwon(product.dailyLimit)],
    product.monthlyLimit && ['월 구매 한도', manwon(product.monthlyLimit)],
    product.maxQty && ['한 번에 최대', `${product.maxQty}장`],
  ].filter(Boolean);

  return <>
    <Header title="상품권 구매" back onBack={goBack} />
    <div className="coupon-body">
      <section className="types-hero">
        <div className={`merchant-logo ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={place.logo} alt="" /></div>
        <h1>{place.name}</h1>
        <p><span className={`fee-chip ${fee ? 'red' : ''}`}>{feeChip}</span>{product.discountLabel && <span className="fee-chip mint">{product.discountLabel}</span>}</p>
      </section>

      {product.soldOut ? <p className="coupon-soldout">지금은 모든 권종이 품절이에요. 다시 들러 주세요.</p> : <ul className="coupon-grid">
        {rows.map(({ item, index, amount, count: n }) => <li key={index} className={`coupon-card ${n ? 'picked' : ''}`}>
          <div className="coupon-face">
            <img src={place.logo} alt="" className={place.logoOnDark ? 'logo-on-dark' : ''} />
            <strong>{itemTitle(item)}</strong>
          </div>
          <div className="coupon-info">
            <span className="coupon-price">{won(amount)}</span>
            {item.price != null ? <small>{item.face ? `액면가 ${won(item.face)}` : ''}</small>
              : fee ? <small className="fee-red">수수료 {feePercent(product)}%</small>
              : <small>{product.feeWaived ? '수수료 지원 중' : '수수료 없음'}</small>}
          </div>
          <div className="stepper" role="group" aria-label={`${itemTitle(item)} 수량`}>
            <button onClick={() => change(index, -1)} disabled={n === 0} aria-label={`${itemTitle(item)} 수량 줄이기`}>−</button>
            <output aria-live="polite">{n}</output>
            <button onClick={() => change(index, 1)} disabled={!canAdd(rows[index])} aria-label={`${itemTitle(item)} 수량 늘리기`}>+</button>
          </div>
        </li>)}
      </ul>}

      {facts.length > 0 && <dl className="coupon-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
          </div>

    <div className="bottom-bar">
      {fee && count > 0 && <p className="fee-red fee-line">구매 금액의 {feePercent(product)}% 수수료가 발생해요.</p>}
      {limitHit && count > 0 && <p className="coupon-warn" role="status">일 구매 한도({manwon(product.dailyLimit)})까지만 담을 수 있어요.</p>}
      {count > 0
        ? <a className="primary-button coupon-buy" href={place.sourceUrl} target="_blank" rel="noopener noreferrer"><span>컬쳐랜드에서 구매하기</span><strong>{count}장 · {won(total)}</strong></a>
        : <button className="primary-button coupon-buy" disabled>{product.soldOut ? '품절' : '금액권을 골라 주세요'}</button>}
    </div>
  </>;
}
