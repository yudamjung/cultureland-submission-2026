import { ASSET } from '../lib/constants';

export default function Header({ title, back = false, onBack }) {
  return <header className="header">
    {back ? <button className="back" onClick={onBack} aria-label="뒤로 가기"><img src={`${ASSET}figma-ai-back.svg`} alt="" /></button> : <span className="brand-logo"><img src={`${ASSET}figma-cultureland-logo.svg`} alt="CULTURE LAND" /></span>}
    <strong>{title}</strong>
  </header>;
}
