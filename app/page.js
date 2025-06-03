import SearchPage from "./search/page";
import OsuverseDiv from '../src/components/OsuverseDiv';
import MainOsuverseDiv from "../src/components/MainOsuverseDiv";
import OsuverseLogo from '../src/components/OsuverseLogo/OsuverseLogo';

export default function Home() {
  return (
    <MainOsuverseDiv className="home-container" style={{ marginTop: 48, marginBottom: 48 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <OsuverseLogo />
        <h1
          style={{
            fontSize: 40,
            fontFamily:
              "Orbitron, Bruno Ace, Rubik Glitch, Cracked Code, Arial",
            letterSpacing: 2,
            color: "#ea81fb",
            textShadow: "0 0 24px #2f0f3a, 0 0 8px #ea81fb",
          }}
        >
          Osuverse
        </h1>
        <SearchPage />
      </div>
    </MainOsuverseDiv>
  );
}
