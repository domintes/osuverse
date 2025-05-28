import SearchPage from "./search/page";
import OsuverseDiv from '../src/components/OsuverseDiv';
import OsuverseLogo from '../src/components/OsuverseLogo/OsuverseLogo';

export default function Home() {
  return (
    <OsuverseDiv style={{ marginTop: 48, marginBottom: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <OsuverseLogo />
        <h1 style={{ fontSize: 40, fontFamily: 'Orbitron, Bruno Ace, Rubik Glitch, Cracked Code, Arial', letterSpacing: 2, color: '#7ee0ff', textShadow: '0 0 24px #1a2a4d, 0 0 8px #7ee0ff' }}>Osuverse</h1>
        <SearchPage />
      </div>
    </OsuverseDiv>
  );
}
